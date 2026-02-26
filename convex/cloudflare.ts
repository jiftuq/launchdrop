"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Cloudflare for SaaS Integration
 *
 * This module handles custom domain SSL and routing via Cloudflare for SaaS.
 *
 * Setup required:
 * 1. Enable Cloudflare for SaaS on your zone
 * 2. Create a fallback origin (e.g., stores.launchdrop.app)
 * 3. Set environment variables:
 *    - CLOUDFLARE_API_TOKEN: API token with Zone:SSL and Custom Hostnames permissions
 *    - CLOUDFLARE_ZONE_ID: Your Cloudflare zone ID
 *
 * Pricing: $0.10/active custom hostname/month (after first 100 free)
 */

interface CustomHostnameResponse {
  success: boolean;
  result?: {
    id: string;
    hostname: string;
    ssl: {
      status: string;
      validation_records?: Array<{
        txt_name: string;
        txt_value: string;
      }>;
    };
    status: string;
    verification_errors?: string[];
  };
  errors?: Array<{ message: string }>;
}

// Add a custom hostname to Cloudflare for SaaS
export const addCustomHostname = action({
  args: {
    domainId: v.id("domains"),
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      // For demo/development, simulate success
      console.log("Cloudflare credentials not configured, simulating...");

      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "pending",
      });

      // Simulate SSL provisioning delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "active",
      });

      return {
        success: true,
        hostname: args.hostname,
        status: "active",
        message: "Domain configured (simulated)",
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
              method: "http",
              type: "dv",
              settings: {
                min_tls_version: "1.2",
              },
            },
          }),
        }
      );

      const data: CustomHostnameResponse = await response.json();

      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || "Failed to add custom hostname");
      }

      // Update domain with SSL status
      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "pending",
      });

      return {
        success: true,
        hostname: args.hostname,
        hostnameId: data.result?.id,
        status: data.result?.ssl.status,
        validationRecords: data.result?.ssl.validation_records,
      };
    } catch (error: any) {
      console.error("Cloudflare API error:", error);

      await ctx.runMutation(api.domains.updateSslStatus, {
        domainId: args.domainId,
        sslStatus: "error",
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Check SSL status for a custom hostname
export const checkSslStatus = action({
  args: {
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { status: "active", message: "Simulated (no Cloudflare config)" };
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${args.hostname}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        }
      );

      const data = await response.json();

      if (data.result && data.result.length > 0) {
        const hostname = data.result[0];
        return {
          status: hostname.ssl?.status || "unknown",
          hostnameStatus: hostname.status,
          verificationErrors: hostname.verification_errors,
        };
      }

      return { status: "not_found" };
    } catch (error: any) {
      return { status: "error", error: error.message };
    }
  },
});

// Delete a custom hostname from Cloudflare
export const deleteCustomHostname = action({
  args: {
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { success: true, message: "Simulated deletion" };
    }

    try {
      // First, find the hostname ID
      const listResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${args.hostname}`,
        {
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          },
        }
      );

      const listData = await listResponse.json();

      if (!listData.result || listData.result.length === 0) {
        return { success: true, message: "Hostname not found (already deleted)" };
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
        }
      );

      const deleteData = await deleteResponse.json();

      return {
        success: deleteData.success,
        message: deleteData.success ? "Hostname deleted" : "Failed to delete hostname",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

/**
 * Domain Connection Instructions for Users
 *
 * When a user wants to connect their own domain (not purchased through us):
 *
 * 1. User adds CNAME record:
 *    - Host: @ (or their subdomain)
 *    - Value: stores.launchdrop.app
 *
 * 2. User adds CNAME record for www:
 *    - Host: www
 *    - Value: stores.launchdrop.app
 *
 * 3. We call addCustomHostname() to register with Cloudflare
 *
 * 4. Cloudflare handles SSL certificate provisioning automatically
 *
 * 5. Our server checks the Host header and serves the correct store
 */
