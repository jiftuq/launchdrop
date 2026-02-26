import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Domain purchases and management
  domains: defineTable({
    storeId: v.optional(v.id("stores")),
    userId: v.optional(v.string()),
    domainName: v.string(),
    status: v.union(
      v.literal("suggested"),
      v.literal("available"),
      v.literal("pending_purchase"),
      v.literal("purchased"),
      v.literal("connected"),
      v.literal("error"),
    ),
    provider: v.optional(v.string()), // cloudflare, namecheap, etc.
    purchasePrice: v.optional(v.number()),
    renewalPrice: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    dnsRecords: v.optional(
      v.array(
        v.object({
          type: v.string(),
          name: v.string(),
          value: v.string(),
          ttl: v.optional(v.number()),
        }),
      ),
    ),
    sslStatus: v.optional(
      v.union(v.literal("pending"), v.literal("active"), v.literal("error")),
    ),
    verificationToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_userId", ["userId"])
    .index("by_domainName", ["domainName"])
    .index("by_status", ["status"]),

  stores: defineTable({
    userId: v.optional(v.string()),
    productUrl: v.string(),
    status: v.union(
      v.literal("scraping"),
      v.literal("analyzing"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),

    // Extracted product data
    productData: v.optional(
      v.object({
        name: v.string(),
        description: v.string(),
        price: v.string(),
        currency: v.string(),
        images: v.array(v.string()),
        features: v.array(v.string()),
        category: v.string(),
        targetAudience: v.string(),
      }),
    ),

    // AI-generated store configuration
    storeConfig: v.optional(
      v.object({
        storeName: v.string(),
        tagline: v.string(),
        logo: v.optional(v.string()),
        // Theme and layout options
        theme: v.optional(
          v.union(
            v.literal("minimal"),
            v.literal("bold"),
            v.literal("luxury"),
            v.literal("playful"),
            v.literal("natural"),
          ),
        ),
        layouts: v.optional(
          v.object({
            hero: v.union(
              v.literal("centered"),
              v.literal("split"),
              v.literal("fullscreen"),
              v.literal("minimal"),
              v.literal("video-style"),
            ),
            testimonials: v.union(
              v.literal("cards"),
              v.literal("carousel"),
              v.literal("stacked"),
              v.literal("minimal"),
              v.literal("featured"),
            ),
          }),
        ),
        sectionOrder: v.optional(v.array(v.string())),
        colorScheme: v.object({
          primary: v.string(),
          secondary: v.string(),
          accent: v.string(),
          background: v.string(),
          surface: v.string(),
          text: v.string(),
          textMuted: v.string(),
        }),
        fonts: v.object({
          heading: v.string(),
          body: v.string(),
        }),
        hero: v.object({
          headline: v.string(),
          subheadline: v.string(),
          ctaText: v.string(),
          badgeText: v.optional(v.string()),
          backgroundImage: v.optional(v.string()),
        }),
        benefits: v.array(
          v.object({
            icon: v.string(),
            title: v.string(),
            description: v.string(),
          }),
        ),
        testimonials: v.array(
          v.object({
            name: v.string(),
            avatar: v.optional(v.string()),
            text: v.string(),
            rating: v.number(),
            verified: v.boolean(),
            title: v.optional(v.string()),
            image: v.optional(v.string()),
          }),
        ),
        comparison: v.optional(
          v.object({
            enabled: v.boolean(),
            title: v.string(),
            us: v.object({
              name: v.string(),
              points: v.array(v.string()),
            }),
            them: v.object({
              name: v.string(),
              points: v.array(v.string()),
            }),
          }),
        ),
        gallery: v.optional(
          v.object({
            enabled: v.boolean(),
            title: v.optional(v.string()),
            images: v.optional(v.array(v.string())),
          }),
        ),
        faq: v.array(
          v.object({
            question: v.string(),
            answer: v.string(),
          }),
        ),
        urgency: v.object({
          stockText: v.string(),
          offerText: v.string(),
          timerEnabled: v.boolean(),
          style: v.optional(
            v.union(
              v.literal("banner"),
              v.literal("floating"),
              v.literal("inline"),
            ),
          ),
        }),
        footer: v.object({
          copyright: v.string(),
          links: v.array(
            v.object({
              label: v.string(),
              href: v.string(),
            }),
          ),
        }),
      }),
    ),

    // Generated full HTML (optional, for export)
    generatedHtml: v.optional(v.string()),

    subdomain: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    domainId: v.optional(v.id("domains")),
    suggestedDomains: v.optional(v.array(v.string())),
    published: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_subdomain", ["subdomain"])
    .index("by_status", ["status"]),
});
