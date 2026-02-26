import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all stores for a user
export const listStores = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a single store by ID
export const getStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

// Get a store by subdomain (for public viewing)
export const getStoreBySubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
  },
});

// Create a new store entry (status: scraping)
export const createStore = mutation({
  args: {
    productUrl: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const storeId = await ctx.db.insert("stores", {
      productUrl: args.productUrl,
      userId: args.userId,
      status: "scraping",
      createdAt: Date.now(),
    });
    return storeId;
  },
});

// Update store status
export const updateStoreStatus = mutation({
  args: {
    storeId: v.id("stores"),
    status: v.union(
      v.literal("scraping"),
      v.literal("analyzing"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storeId, {
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

// Save extracted product data
export const saveProductData = mutation({
  args: {
    storeId: v.id("stores"),
    productData: v.object({
      name: v.string(),
      description: v.string(),
      price: v.string(),
      currency: v.string(),
      images: v.array(v.string()),
      features: v.array(v.string()),
      category: v.string(),
      targetAudience: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storeId, {
      productData: args.productData,
      status: "generating",
      updatedAt: Date.now(),
    });
  },
});

// Save AI-generated store config
export const saveStoreConfig = mutation({
  args: {
    storeId: v.id("stores"),
    storeConfig: v.any(),
    generatedHtml: v.optional(v.string()),
    suggestedDomains: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const subdomain = `store-${args.storeId.toString().slice(-8)}`;
    await ctx.db.patch(args.storeId, {
      storeConfig: args.storeConfig,
      generatedHtml: args.generatedHtml,
      subdomain,
      suggestedDomains: args.suggestedDomains,
      status: "ready",
      published: false,
      updatedAt: Date.now(),
    });
  },
});

// Publish / unpublish store
export const togglePublish = mutation({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    await ctx.db.patch(args.storeId, {
      published: !store.published,
      updatedAt: Date.now(),
    });
  },
});

// Delete store
export const deleteStore = mutation({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.storeId);
  },
});
