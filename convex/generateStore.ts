"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// ── Main pipeline: scrape → analyze → generate store ──────────────────────
export const generateStore = action({
  args: {
    storeId: v.id("stores"),
    productUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!CLAUDE_API_KEY) {
      await ctx.runMutation(api.stores.updateStoreStatus, {
        storeId: args.storeId,
        status: "error",
        errorMessage: "Missing ANTHROPIC_API_KEY environment variable",
      });
      return;
    }

    try {
      // ── Step 1: Scrape product page ─────────────────────────────────
      await ctx.runMutation(api.stores.updateStoreStatus, {
        storeId: args.storeId,
        status: "scraping",
      });

      let pageContent = "";
      let extractedImages: string[] = [];
      let extractedReviews: ExtractedReview[] = [];

      try {
        const res = await fetch(args.productUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });
        const fullHtml = await res.text();

        // Extract images from HTML before trimming
        extractedImages = extractProductImages(fullHtml, args.productUrl);

        // Extract reviews/testimonials from HTML
        extractedReviews = extractReviews(fullHtml);

        // Trim HTML for Claude context
        pageContent = fullHtml.slice(0, 15000);
      } catch {
        pageContent = `URL: ${args.productUrl} (could not fetch — generate based on URL patterns)`;
      }

      // ── Step 2: Analyze product with Claude ─────────────────────────
      await ctx.runMutation(api.stores.updateStoreStatus, {
        storeId: args.storeId,
        status: "analyzing",
      });

      const productData = await callClaude(CLAUDE_API_KEY, {
        system: `You are an expert e-commerce product analyst. Extract product information from the provided webpage HTML and URL. Return ONLY valid JSON, no markdown fences.`,
        prompt: `Analyze this product page and extract structured data.

URL: ${args.productUrl}

Page content (HTML excerpt):
${pageContent}

Return this exact JSON structure:
{
  "name": "Product Name",
  "description": "Compelling 2-3 sentence sales description",
  "price": "29.99",
  "currency": "USD",
  "images": ["url1", "url2"],
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "category": "Category Name",
  "targetAudience": "Description of ideal buyer"
}

If you can't extract certain fields, make intelligent guesses based on the URL and any available content. Always return valid JSON.`,
      });

      let parsedProduct;
      try {
        parsedProduct = JSON.parse(cleanJson(productData));
      } catch {
        parsedProduct = {
          name: "Premium Product",
          description: "An exceptional product sourced for quality and value.",
          price: "49.99",
          currency: "USD",
          images: [],
          features: [
            "Premium quality materials",
            "Fast worldwide shipping",
            "30-day money back guarantee",
            "Eco-friendly packaging",
            "Award-winning design",
          ],
          category: "General",
          targetAudience: "Quality-conscious online shoppers",
        };
      }

      // Merge scraped images with Claude's extracted images
      // Prefer scraped images as they're more reliable
      const claudeImages = parsedProduct.images || [];
      const allImages = [...new Set([...extractedImages, ...claudeImages])];
      parsedProduct.images = allImages.slice(0, 10); // Keep up to 10 images

      await ctx.runMutation(api.stores.saveProductData, {
        storeId: args.storeId,
        productData: parsedProduct,
      });

      // ── Step 3: Generate store config with Claude ───────────────────
      const reviewsContext =
        extractedReviews.length > 0
          ? `\n\nSCRAPED REAL REVIEWS FROM THE PRODUCT PAGE (use these as testimonials, clean up the text if needed):\n${JSON.stringify(extractedReviews.slice(0, 6), null, 2)}`
          : "";

      const storeConfigRaw = await callClaude(CLAUDE_API_KEY, {
        system: `You are an elite e-commerce store designer and conversion rate optimization expert. You create stunning, high-converting single-product stores with unique layouts and themes. Return ONLY valid JSON, no markdown fences.`,
        prompt: `Create a complete store configuration for this product:

Product: ${JSON.stringify(parsedProduct)}${reviewsContext}

Generate a JSON store config. Be creative with the store name — don't just use the product name. Pick a brandable, memorable store name that fits the niche.

IMPORTANT: Choose the most appropriate THEME and LAYOUTS based on the product type and target audience:

THEME OPTIONS (pick one):
- "minimal" - Clean, lots of whitespace, subtle colors, modern sans-serif fonts. Best for: tech, premium, professional products
- "bold" - High contrast, vibrant colors, strong typography, dynamic. Best for: youth, sports, energy products
- "luxury" - Dark/gold tones, serif fonts, elegant spacing, premium feel. Best for: jewelry, fashion, high-end items
- "playful" - Bright colors, rounded shapes, fun fonts, friendly. Best for: kids, pets, casual lifestyle products
- "natural" - Earth tones, organic shapes, warm feel. Best for: eco, wellness, food, handmade products

HERO LAYOUT OPTIONS (pick one):
- "centered" - Centered text, product below, classic layout
- "split" - Text on left, product image on right (50/50 split)
- "fullscreen" - Large background image with overlay text
- "minimal" - Just headline and CTA, very clean
- "video-style" - Designed for video background (dark overlay)

TESTIMONIAL LAYOUT OPTIONS (pick one):
- "cards" - Individual cards in a grid
- "carousel" - Single testimonial with arrows to navigate
- "stacked" - Vertical stack with large quotes
- "minimal" - Simple text with small avatars inline
- "featured" - One large featured testimonial + smaller ones

SECTION ORDER: Choose which sections to include and in what order. Not all sections are required.
Available sections: hero, urgency, benefits, features, testimonials, comparison, gallery, faq, finalCta

Return this exact JSON structure:
{
  "storeName": "BrandName",
  "tagline": "Short memorable tagline",
  "theme": "minimal|bold|luxury|playful|natural",
  "layouts": {
    "hero": "centered|split|fullscreen|minimal|video-style",
    "testimonials": "cards|carousel|stacked|minimal|featured"
  },
  "sectionOrder": ["hero", "urgency", "benefits", "testimonials", "features", "faq", "finalCta"],
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textMuted": "#hex"
  },
  "fonts": {
    "heading": "Google Font Name",
    "body": "Google Font Name"
  },
  "hero": {
    "headline": "Attention-grabbing headline",
    "subheadline": "Supporting value proposition sentence",
    "ctaText": "CTA button text",
    "badgeText": "Optional badge like FREE SHIPPING or NEW",
    "backgroundImage": "optional URL or null"
  },
  "benefits": [
    { "icon": "emoji", "title": "Benefit Title", "description": "Short benefit description" },
    { "icon": "emoji", "title": "Benefit Title", "description": "Short benefit description" },
    { "icon": "emoji", "title": "Benefit Title", "description": "Short benefit description" },
    { "icon": "emoji", "title": "Benefit Title", "description": "Short benefit description" }
  ],
  "testimonials": [
    // IF SCRAPED REVIEWS PROVIDED ABOVE: Use them! Clean up the text, format names as "First L.", keep real ratings
    // IF NO SCRAPED REVIEWS: Generate realistic-sounding testimonials based on product benefits
    { "name": "First L.", "text": "Actual review text from customer", "rating": 5, "verified": true, "title": "Optional job title", "image": "optional avatar URL" },
    { "name": "First L.", "text": "Actual review text from customer", "rating": 5, "verified": true },
    { "name": "First L.", "text": "Actual review text from customer", "rating": 4, "verified": true }
  ],
  "comparison": {
    "enabled": true or false,
    "title": "Why Choose Us?",
    "us": { "name": "Our Product", "points": ["Feature 1", "Feature 2", "Feature 3"] },
    "them": { "name": "Others", "points": ["Lacks X", "Expensive", "Poor quality"] }
  },
  "gallery": {
    "enabled": true or false,
    "title": "See It In Action",
    "images": ["url1", "url2", "url3"]
  },
  "faq": [
    { "question": "Common question?", "answer": "Helpful answer" },
    { "question": "Common question?", "answer": "Helpful answer" },
    { "question": "Common question?", "answer": "Helpful answer" }
  ],
  "urgency": {
    "stockText": "Only X left in stock!",
    "offerText": "Limited time: XX% off today only",
    "timerEnabled": true,
    "style": "banner|floating|inline"
  },
  "footer": {
    "copyright": "© 2025 StoreName. All rights reserved.",
    "links": [
      { "label": "Privacy Policy", "href": "/privacy" },
      { "label": "Terms of Service", "href": "/terms" },
      { "label": "Contact Us", "href": "/contact" },
      { "label": "Shipping Info", "href": "/shipping" }
    ]
  }
}

GUIDELINES:
- For luxury products, use "luxury" theme with "split" or "fullscreen" hero and "featured" testimonials
- For tech products, use "minimal" theme with "centered" hero and "cards" testimonials
- For kids/fun products, use "playful" theme with "fullscreen" hero and "carousel" testimonials
- Include "comparison" section for products with clear competitors
- Include "gallery" only if product has multiple use cases or angles
- Order sections strategically: urgency early for impulse buys, testimonials early for trust-building`,
      });

      let parsedConfig;
      try {
        parsedConfig = JSON.parse(cleanJson(storeConfigRaw));
      } catch {
        throw new Error("Failed to parse store configuration from AI");
      }

      // ── Step 4: Generate domain suggestions ───────────────────────
      const domainSuggestionsRaw = await callClaude(CLAUDE_API_KEY, {
        system: `You are a domain name expert. Generate creative, brandable, and available-sounding domain names. Return ONLY valid JSON, no markdown fences.`,
        prompt: `Generate 5 domain name suggestions for this store:

Store Name: ${parsedConfig.storeName}
Product: ${parsedProduct.name}
Category: ${parsedProduct.category}
Target Audience: ${parsedProduct.targetAudience}

Rules:
- Short (max 15 characters before TLD)
- Easy to spell and remember
- Brandable and professional
- Mix of .com, .co, .shop, .store TLDs
- Avoid hyphens and numbers

Return this exact JSON:
{
  "domains": [
    "domain1.com",
    "domain2.co",
    "domain3.shop",
    "domain4.store",
    "domain5.com"
  ]
}`,
      });

      let suggestedDomains: string[] = [];
      try {
        const parsed = JSON.parse(cleanJson(domainSuggestionsRaw));
        suggestedDomains = parsed.domains || [];
      } catch {
        // Fallback: generate from store name
        const slug = parsedConfig.storeName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        suggestedDomains = [
          `${slug}.com`,
          `${slug}.co`,
          `${slug}.shop`,
          `get${slug}.com`,
          `${slug}store.com`,
        ];
      }

      // ── Step 5: Save everything ─────────────────────────────────────
      await ctx.runMutation(api.stores.saveStoreConfig, {
        storeId: args.storeId,
        storeConfig: parsedConfig,
        suggestedDomains,
      });
    } catch (error: any) {
      await ctx.runMutation(api.stores.updateStoreStatus, {
        storeId: args.storeId,
        status: "error",
        errorMessage: error.message || "Unknown error during generation",
      });
    }
  },
});

// ── Claude API helper ─────────────────────────────────────────────────────
async function callClaude(
  apiKey: string,
  opts: { system: string; prompt: string },
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  return textBlock?.text ?? "";
}

// ── Strip markdown fences from JSON ───────────────────────────────────────
function cleanJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ── Extract product images from HTML ──────────────────────────────────────
function extractProductImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Parse base URL for resolving relative paths
  let urlBase: URL;
  try {
    urlBase = new URL(baseUrl);
  } catch {
    return [];
  }

  // Helper to resolve and validate image URL
  const addImage = (src: string | null | undefined) => {
    if (!src) return;

    // Skip data URLs, tiny images, icons, logos, etc.
    if (src.startsWith("data:")) return;
    if (src.includes("icon") || src.includes("logo") || src.includes("sprite"))
      return;
    if (src.includes("1x1") || src.includes("pixel")) return;

    // Resolve relative URLs
    let fullUrl: string;
    try {
      if (src.startsWith("//")) {
        fullUrl = `https:${src}`;
      } else if (src.startsWith("/")) {
        fullUrl = `${urlBase.origin}${src}`;
      } else if (!src.startsWith("http")) {
        fullUrl = new URL(src, baseUrl).href;
      } else {
        fullUrl = src;
      }
    } catch {
      return;
    }

    // Skip duplicates
    const normalized = fullUrl.split("?")[0]; // Remove query params for dedup
    if (seen.has(normalized)) return;
    seen.add(normalized);

    // Only include likely product images (decent size indicators in URL)
    const isLikelyProduct =
      fullUrl.includes("product") ||
      fullUrl.includes("item") ||
      fullUrl.includes("goods") ||
      fullUrl.includes("img") ||
      /\d{3,}x\d{3,}/.test(fullUrl) || // Size in URL like 500x500
      /_[A-Z]{2}\d{3,}/.test(fullUrl) || // Amazon pattern _AC_SL1500
      fullUrl.includes("large") ||
      fullUrl.includes("zoom") ||
      fullUrl.includes("main");

    if (isLikelyProduct || images.length < 3) {
      images.push(fullUrl);
    }
  };

  // Pattern 1: Standard img tags with src
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgSrcRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Pattern 2: data-src (lazy loading)
  const dataSrcRegex = /data-src=["']([^"']+)["']/gi;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Pattern 3: data-large-image or data-zoom-image
  const dataLargeRegex =
    /data-(?:large|zoom|hires|original)-?(?:image|src)?=["']([^"']+)["']/gi;
  while ((match = dataLargeRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Pattern 4: srcset (get largest image)
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const srcset = match[1];
    // Parse srcset and get the largest image
    const sources = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]);
    sources.forEach(addImage);
  }

  // Pattern 5: JSON-LD structured data
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      // Handle single object or array
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];
      for (const item of items) {
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          imgs.forEach((img: any) => {
            if (typeof img === "string") addImage(img);
            else if (img?.url) addImage(img.url);
          });
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Pattern 6: Open Graph images
  const ogImageRegex =
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
  while ((match = ogImageRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Return unique images, limit to 10
  return images.slice(0, 10);
}

// ── Type for extracted reviews ────────────────────────────────────────────
interface ExtractedReview {
  name: string;
  text: string;
  rating?: number;
  date?: string;
  title?: string;
  verified?: boolean;
}

// ── Extract reviews/testimonials from HTML ────────────────────────────────
function extractReviews(html: string): ExtractedReview[] {
  const reviews: ExtractedReview[] = [];
  const seen = new Set<string>();

  // Helper to clean text
  const cleanText = (text: string): string => {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Helper to add unique review
  const addReview = (review: ExtractedReview) => {
    if (!review.text || review.text.length < 20) return;
    if (review.text.length > 500)
      review.text = review.text.slice(0, 497) + "...";

    const key = review.text.slice(0, 50).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    reviews.push(review);
  };

  // Pattern 1: JSON-LD Review structured data
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];

      for (const item of items) {
        // Direct reviews array
        if (item.review) {
          const reviewsArr = Array.isArray(item.review)
            ? item.review
            : [item.review];
          for (const r of reviewsArr) {
            addReview({
              name: r.author?.name || r.author || "Customer",
              text: cleanText(r.reviewBody || r.description || ""),
              rating: r.reviewRating?.ratingValue || r.rating,
              date: r.datePublished,
              title: r.name,
            });
          }
        }

        // AggregateRating with reviews
        if (item["@type"] === "Review") {
          addReview({
            name: item.author?.name || item.author || "Customer",
            text: cleanText(item.reviewBody || item.description || ""),
            rating: item.reviewRating?.ratingValue,
            date: item.datePublished,
            title: item.name,
          });
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Pattern 2: Common review container patterns
  // Amazon-style reviews
  const amazonReviewRegex =
    /class="[^"]*review-text[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/[^>]+>/gi;
  while ((match = amazonReviewRegex.exec(html)) !== null) {
    addReview({
      name: "Verified Buyer",
      text: cleanText(match[1]),
      verified: true,
    });
  }

  // Star rating patterns (look for rating near review text)
  const ratingPatterns = [
    /(\d)(?:\s*\/\s*5|\s*out\s*of\s*5|\s*stars?)/gi,
    /rating['":\s]+(\d)/gi,
    /stars?['":\s]+(\d)/gi,
  ];

  // Generic review blocks with data attributes
  const dataReviewRegex =
    /data-review-(?:text|body|content)=["']([^"']+)["']/gi;
  while ((match = dataReviewRegex.exec(html)) !== null) {
    addReview({
      name: "Customer",
      text: cleanText(match[1]),
    });
  }

  // Pattern 3: Trustpilot/Yotpo style embedded reviews
  const reviewBodyRegex =
    /(?:review-?(?:body|text|content)|testimonial-?(?:text|content))[^>]*>([^<]{30,500})</gi;
  while ((match = reviewBodyRegex.exec(html)) !== null) {
    addReview({
      name: "Customer",
      text: cleanText(match[1]),
    });
  }

  // Pattern 4: Blockquote testimonials
  const blockquoteRegex = /<blockquote[^>]*>([^<]{30,500})</gi;
  while ((match = blockquoteRegex.exec(html)) !== null) {
    const text = cleanText(match[1]);
    // Only add if it looks like a testimonial (has first-person language)
    if (/\b(I|my|me|we|our|I'm|I've|I'd)\b/i.test(text)) {
      addReview({
        name: "Customer",
        text,
      });
    }
  }

  // Pattern 5: Look for reviewer names near review text
  const reviewerNameRegex =
    /(?:reviewer?-?name|author-?name|customer-?name)[^>]*>([^<]{2,50})</gi;
  const names: string[] = [];
  while ((match = reviewerNameRegex.exec(html)) !== null) {
    names.push(cleanText(match[1]));
  }

  // Assign names to reviews that don't have them
  reviews.forEach((review, i) => {
    if (review.name === "Customer" && names[i]) {
      review.name = names[i];
    }
  });

  // Pattern 6: Look for star ratings and associate with reviews
  reviews.forEach((review) => {
    if (!review.rating) {
      // Default to 5 if we couldn't extract rating
      review.rating = 5;
    }
    review.verified = review.verified ?? true;
  });

  return reviews.slice(0, 10);
}
