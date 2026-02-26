"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// ── Actions (External API calls) ──────────────────────────────────────────

// Check domain availability (using a domain API)
export const checkDomainAvailability = action({
  args: {
    domains: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // In production, you would call a real domain registrar API
    // For now, we'll simulate availability checking

    const results: Array<{
      domain: string;
      available: boolean;
      price: number;
      renewalPrice: number;
      premium: boolean;
    }> = [];

    for (const domain of args.domains) {
      // Simulate API call - in production use Namecheap, Cloudflare, or GoDaddy API
      const tld = domain.split(".").pop() || "com";

      // Pricing based on TLD
      const pricing: Record<string, { price: number; renewal: number }> = {
        com: { price: 12.99, renewal: 14.99 },
        co: { price: 9.99, renewal: 24.99 },
        shop: { price: 4.99, renewal: 34.99 },
        store: { price: 4.99, renewal: 29.99 },
        io: { price: 39.99, renewal: 49.99 },
        app: { price: 14.99, renewal: 19.99 },
        dev: { price: 14.99, renewal: 19.99 },
      };

      const tldPricing = pricing[tld] || { price: 12.99, renewal: 14.99 };

      // Simulate 70% availability (random for demo)
      const isAvailable = Math.random() > 0.3;

      results.push({
        domain,
        available: isAvailable,
        price: tldPricing.price,
        renewalPrice: tldPricing.renewal,
        premium: tldPricing.price > 20,
      });
    }

    return results;
  },
});

// Purchase domain (simulated - would integrate with registrar API)
export const purchaseDomain = action({
  args: {
    domainId: v.id("domains"),
    domainName: v.string(),
    storeId: v.id("stores"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In production, this would:
    // 1. Create Stripe checkout session
    // 2. On payment success, call registrar API to purchase
    // 3. Configure DNS records automatically

    // For now, simulate the purchase
    await ctx.runMutation(api.domains.updateDomainStatus, {
      domainId: args.domainId,
      status: "pending_purchase",
    });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mark as purchased
    await ctx.runMutation(api.domains.updateDomainStatus, {
      domainId: args.domainId,
      status: "purchased",
      provider: "launchdrop", // Would be actual registrar
      purchasePrice: 12.99,
      renewalPrice: 14.99,
    });

    // Set up DNS records for the domain
    await ctx.runMutation(api.domains.saveDnsRecords, {
      domainId: args.domainId,
      dnsRecords: [
        {
          type: "CNAME",
          name: "@",
          value: "stores.launchdrop.app",
          ttl: 3600,
        },
        {
          type: "CNAME",
          name: "www",
          value: "stores.launchdrop.app",
          ttl: 3600,
        },
      ],
    });

    // Connect domain to store
    await ctx.runMutation(api.domains.connectDomainToStore, {
      domainId: args.domainId,
      storeId: args.storeId,
    });

    // Update SSL status
    await ctx.runMutation(api.domains.updateSslStatus, {
      domainId: args.domainId,
      sslStatus: "pending",
    });

    // In production, Cloudflare for SaaS would handle SSL
    // Simulate SSL provisioning
    await new Promise((resolve) => setTimeout(resolve, 500));

    await ctx.runMutation(api.domains.updateSslStatus, {
      domainId: args.domainId,
      sslStatus: "active",
    });

    return {
      success: true,
      domain: args.domainName,
      message: "Domain purchased and connected successfully!",
    };
  },
});

// Verify domain ownership (for external domains)
export const verifyDomainOwnership = action({
  args: {
    domainId: v.id("domains"),
    domainName: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a verification token
    const token = `launchdrop-verify-${Math.random().toString(36).substring(2, 15)}`;

    // In production, you would:
    // 1. Store the token
    // 2. Ask user to add TXT record
    // 3. Verify the TXT record exists

    return {
      verificationToken: token,
      instructions: [
        `Add a TXT record to your domain's DNS settings:`,
        `Host/Name: _launchdrop-verification`,
        `Value: ${token}`,
        `TTL: 3600 (or default)`,
        ``,
        `After adding the record, click "Verify" to confirm ownership.`,
      ],
    };
  },
});
