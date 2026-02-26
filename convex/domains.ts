import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────

// Get domains for a store
export const getDomainsForStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("domains")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

// Get domain by name
export const getDomainByName = query({
  args: { domainName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("domains")
      .withIndex("by_domainName", (q) => q.eq("domainName", args.domainName))
      .first();
  },
});

// Get all domains for a user
export const listUserDomains = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("domains")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────

// Create a domain suggestion entry
export const createDomainSuggestion = mutation({
  args: {
    storeId: v.id("stores"),
    domainName: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("domains", {
      storeId: args.storeId,
      userId: args.userId,
      domainName: args.domainName,
      status: "suggested",
      createdAt: Date.now(),
    });
  },
});

// Update domain status
export const updateDomainStatus = mutation({
  args: {
    domainId: v.id("domains"),
    status: v.union(
      v.literal("suggested"),
      v.literal("available"),
      v.literal("pending_purchase"),
      v.literal("purchased"),
      v.literal("connected"),
      v.literal("error"),
    ),
    purchasePrice: v.optional(v.number()),
    renewalPrice: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.domainId, {
      status: args.status,
      purchasePrice: args.purchasePrice,
      renewalPrice: args.renewalPrice,
      provider: args.provider,
      updatedAt: Date.now(),
    });
  },
});

// Save DNS records for a domain
export const saveDnsRecords = mutation({
  args: {
    domainId: v.id("domains"),
    dnsRecords: v.array(
      v.object({
        type: v.string(),
        name: v.string(),
        value: v.string(),
        ttl: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.domainId, {
      dnsRecords: args.dnsRecords,
      updatedAt: Date.now(),
    });
  },
});

// Connect domain to store
export const connectDomainToStore = mutation({
  args: {
    domainId: v.id("domains"),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    // Update domain
    await ctx.db.patch(args.domainId, {
      storeId: args.storeId,
      status: "connected",
      updatedAt: Date.now(),
    });

    // Get domain name
    const domain = await ctx.db.get(args.domainId);
    if (!domain) throw new Error("Domain not found");

    // Update store with custom domain
    await ctx.db.patch(args.storeId, {
      customDomain: domain.domainName,
      domainId: args.domainId,
      updatedAt: Date.now(),
    });
  },
});

// Update SSL status
export const updateSslStatus = mutation({
  args: {
    domainId: v.id("domains"),
    sslStatus: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("error"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.domainId, {
      sslStatus: args.sslStatus,
      updatedAt: Date.now(),
    });
  },
});
