"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Cloudflare for SaaS Integration
 *
 * This module handles custom domain SSL and routing via Cloudflare for SaaS.
 *
 * SETUP INSTRUCTIONS:
 * ===================
 *
 * 1. Go to Cloudflare Dashboard → Your Domain → SSL/TLS → Custom Hostnames
 *
 * 2. Enable "Cloudflare for SaaS"
 *
 * 3. Set your fallback origin:
 *    - Create a DNS record: stores.launchdrop.app → your server IP
 *    - Or use a worker/pages URL as fallback
 *
 * 4. Create an API Token:
 *    - Go to My Profile → API Tokens → Create Token
 *    - Permissions needed:
 *      • Zone → SSL and Certificates → Edit
 *      • Zone → Custom Hostnames → Edit
 *    - Zone Resources: Include → Specific Zone → your domain
 *
 * 5. Get your Zone ID:
 *    - Dashboard → Your Domain → Overview (right sidebar)
 *
 * 6. Set environment variables in Convex:
 *    npx convex env set CLOUDFLARE_API_TOKEN your-token
 *    npx convex env set CLOUDFLARE_ZONE_ID your-zone-id
 *    npx convex env set CLOUDFLARE_FALLBACK_ORIGIN stores.launchdrop.app
 *
 * Pricing: $0.10/active custom hostname/month (first 100 free)
 */

const FALLBACK_ORIGIN = "stores.launchdrop.app";

interface CloudflareResponse<T> {
  success: boolean;
  result?: T;
  errors?: Array<{ code: number; message: string }>;
  messages?: Array<{ message: string }>;
}

interface CustomHostname {
  id: string;
  hostname: string;
  ssl: {
    id?: string;
    status:
      | "initializing"
      | "pending_validation"
      | "pending_issuance"
      | "pending_deployment"
      | "active"
      | "deleted";
    method: "http" | "txt" | "email";
    type: "dv";
    validation_records?: Array<{
      txt_name: string;
      txt_value: string;
    }>;
    validation_errors?: Array<{ message: string }>;
  };
  status:
    | "active"
    | "pending"
    | "active_redeploying"
    | "moved"
    | "pending_deletion"
    | "deleted";
  verification_errors?: string[];
  ownership_verification?: {
    type: "txt";
    name: string;
    value: string;
  };
  ownership_verification_http?: {
    http_url: string;
    http_body: string;
  };
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADD CUSTOM HOSTNAME
// ═══════════════════════════════════════════════════════════════════════════

export const addCustomHostname = action({
  args: {
    domainId: v.id("domains"),
    hostname: v.string(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    // Update status to pending
    await ctx.runMutation(api.domains.updateDomainStatus, {
      domainId: args.domainId,
      status: "pending_purchase",
    });

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      console.log("⚠️ Cloudflare not configured - running in simulation mode");

      // Simulate for development
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "active",
      });

      await ctx.runMutation(api.domains.connectDomainToStore, {
        domainId: args.domainId,
        storeId: args.storeId,
      });

      return {
        success: true,
        simulated: true,
        hostname: args.hostname,
        status: "active",
        message:
          "Domain connected (simulation mode - set CLOUDFLARE_API_TOKEN for production)",
      };
    }

    try {
      // Create custom hostname in Cloudflare
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostname: args.hostname,
            ssl: {
              method: "http", // HTTP validation (automatic)
              type: "dv",
              settings: {
                min_tls_version: "1.2",
                http2: "on",
                early_hints: "on",
              },
              bundle_method: "ubiquitous",
              wildcard: false,
            },
            custom_metadata: {
              storeId: args.storeId,
              domainId: args.domainId,
            },
          }),
        },
      );

      const data: CloudflareResponse<CustomHostname> = await response.json();

      if (!data.success || !data.result) {
        const errorMsg =
          data.errors?.[0]?.message || "Failed to add custom hostname";
        console.error("Cloudflare error:", errorMsg);

        await ctx.runMutation(api.domains.updateDomainStatus, {
          domainId: args.domainId,
          status: "error",
        });

        return {
          success: false,
          error: errorMsg,
        };
      }

      const hostname = data.result;

      // Save Cloudflare hostname ID and DNS records
      await ctx.runMutation(api.domains.saveDnsRecords, {
        domainId: args.domainId,
        dnsRecords: [
          {
            type: "CNAME",
            name: args.hostname,
            value: FALLBACK_ORIGIN,
            ttl: 3600,
          },
        ],
      });

      // Update SSL status based on Cloudflare response
      const sslStatus = hostname.ssl.status === "active" ? "active" : "pending";
      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus,
      });

      // If SSL is already active, connect the domain
      if (hostname.ssl.status === "active" && hostname.status === "active") {
        await ctx.runMutation(api.domains.connectDomainToStore, {
          domainId: args.domainId,
          storeId: args.storeId,
        });
      }

      return {
        success: true,
        hostname: args.hostname,
        hostnameId: hostname.id,
        sslStatus: hostname.ssl.status,
        hostnameStatus: hostname.status,
        ownershipVerification: hostname.ownership_verification,
        validationRecords: hostname.ssl.validation_records,
        message:
          hostname.ssl.status === "active"
            ? "Domain connected successfully!"
            : "Domain added - SSL certificate is being provisioned",
      };
    } catch (error: any) {
      console.error("Cloudflare API error:", error);

      await ctx.runMutation(api.domains.updateDomainStatus, {
        domainId: args.domainId,
        status: "error",
      });

      return {
        success: false,
        error: error.message || "Failed to connect domain",
      };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// VERIFY DNS AND CHECK SSL STATUS
// ═══════════════════════════════════════════════════════════════════════════

export const verifyAndActivateDomain = action({
  args: {
    domainId: v.id("domains"),
    hostname: v.string(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      // Simulation mode
      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "active",
      });
      await ctx.runMutation(api.domains.connectDomainToStore, {
        domainId: args.domainId,
        storeId: args.storeId,
      });
      return { success: true, status: "active", simulated: true };
    }

    try {
      // Get hostname status from Cloudflare
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(args.hostname)}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        },
      );

      const data: CloudflareResponse<CustomHostname[]> = await response.json();

      if (!data.success || !data.result || data.result.length === 0) {
        return {
          success: false,
          error: "Domain not found in Cloudflare. Please add it first.",
        };
      }

      const hostname = data.result[0];

      // Update SSL status in our database
      const sslStatus = hostname.ssl.status === "active" ? "active" : "pending";
      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus,
      });

      // If both hostname and SSL are active, connect the domain
      if (hostname.status === "active" && hostname.ssl.status === "active") {
        await ctx.runMutation(api.domains.connectDomainToStore, {
          domainId: args.domainId,
          storeId: args.storeId,
        });

        return {
          success: true,
          status: "active",
          message: "Domain verified and connected!",
        };
      }

      // Return current status with any errors
      return {
        success: true,
        status: hostname.ssl.status,
        hostnameStatus: hostname.status,
        verificationErrors: hostname.verification_errors,
        sslErrors: hostname.ssl.validation_errors?.map((e) => e.message),
        message: `SSL Status: ${hostname.ssl.status}. Hostname Status: ${hostname.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to verify domain",
      };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// GET HOSTNAME STATUS
// ═══════════════════════════════════════════════════════════════════════════

export const getHostnameStatus = action({
  args: {
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return {
        success: true,
        status: "active",
        sslStatus: "active",
        simulated: true,
      };
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(args.hostname)}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        },
      );

      const data: CloudflareResponse<CustomHostname[]> = await response.json();

      if (!data.success || !data.result || data.result.length === 0) {
        return { success: false, status: "not_found" };
      }

      const hostname = data.result[0];

      return {
        success: true,
        id: hostname.id,
        hostname: hostname.hostname,
        status: hostname.status,
        sslStatus: hostname.ssl.status,
        sslMethod: hostname.ssl.method,
        verificationErrors: hostname.verification_errors,
        sslErrors: hostname.ssl.validation_errors?.map((e) => e.message),
        ownershipVerification: hostname.ownership_verification,
        createdAt: hostname.created_at,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// DELETE CUSTOM HOSTNAME
// ═══════════════════════════════════════════════════════════════════════════

export const deleteCustomHostname = action({
  args: {
    hostname: v.string(),
    domainId: v.optional(v.id("domains")),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { success: true, simulated: true };
    }

    try {
      // First, find the hostname ID
      const listResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(args.hostname)}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        },
      );

      const listData: CloudflareResponse<CustomHostname[]> =
        await listResponse.json();

      if (!listData.result || listData.result.length === 0) {
        return {
          success: true,
          message: "Hostname not found (already deleted)",
        };
      }

      const hostnameId = listData.result[0].id;

      // Delete the hostname
      const deleteResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        },
      );

      const deleteData: CloudflareResponse<{ id: string }> =
        await deleteResponse.json();

      return {
        success: deleteData.success,
        message: deleteData.success
          ? "Domain disconnected"
          : "Failed to disconnect domain",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// REFRESH SSL CERTIFICATE
// ═══════════════════════════════════════════════════════════════════════════

export const refreshSslCertificate = action({
  args: {
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { success: true, simulated: true };
    }

    try {
      // Get hostname ID
      const listResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(args.hostname)}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        },
      );

      const listData: CloudflareResponse<CustomHostname[]> =
        await listResponse.json();

      if (!listData.result || listData.result.length === 0) {
        return { success: false, error: "Hostname not found" };
      }

      const hostnameId = listData.result[0].id;

      // Trigger SSL refresh by updating the hostname
      const refreshResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssl: {
              method: "http",
              type: "dv",
            },
          }),
        },
      );

      const refreshData: CloudflareResponse<CustomHostname> =
        await refreshResponse.json();

      return {
        success: refreshData.success,
        sslStatus: refreshData.result?.ssl.status,
        message: refreshData.success
          ? "SSL refresh initiated"
          : "Failed to refresh SSL",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
