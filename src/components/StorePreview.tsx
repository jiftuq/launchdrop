import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Globe,
} from "lucide-react";
import DomainSelector from "./DomainSelector";
import {
  HeroSection,
  TestimonialsSection,
  UrgencySection,
  ComparisonSection,
  GallerySection,
} from "./store";

export default function StorePreview() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const store = useQuery(api.stores.getStore, {
    storeId: storeId as Id<"stores">,
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [purchasedDomain, setPurchasedDomain] = useState<string | null>(null);

  const togglePublish = useMutation(api.stores.togglePublish);

  if (
    !store ||
    store.status !== "ready" ||
    !store.storeConfig ||
    !store.productData
  ) {
    return (
      <div style={styles.loading}>
        <p style={{ color: "var(--text-muted)" }}>Loading store preview…</p>
      </div>
    );
  }

  const config = store.storeConfig as any;
  const product = store.productData as any;
  const colors = config.colorScheme;
  const fonts = config.fonts;
  const theme = config.theme || "minimal";
  const layouts = config.layouts || { hero: "centered", testimonials: "cards" };
  const sectionOrder = config.sectionOrder || [
    "hero",
    "urgency",
    "benefits",
    "features",
    "testimonials",
    "faq",
    "finalCta",
  ];

  // Dynamic CSS variables
  const storeVars: React.CSSProperties & Record<string, string> = {
    "--s-primary": colors.primary,
    "--s-secondary": colors.secondary,
    "--s-accent": colors.accent,
    "--s-bg": colors.background,
    "--s-surface": colors.surface,
    "--s-text": colors.text,
    "--s-text-muted": colors.textMuted,
  } as any;

  // Theme-specific styles
  const themeStyles = getThemeStyles(theme, colors);

  // Section renderer
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return (
          <HeroSection
            key="hero"
            config={config}
            product={product}
            colors={colors}
            fonts={fonts}
            layout={layouts.hero}
            theme={theme}
          />
        );

      case "urgency":
        return config.urgency?.timerEnabled || config.urgency?.offerText ? (
          <UrgencySection
            key="urgency"
            urgency={config.urgency}
            colors={colors}
            fonts={fonts}
            theme={theme}
          />
        ) : null;

      case "benefits":
        return config.benefits?.length > 0 ? (
          <section key="benefits" style={{ padding: "80px 0" }}>
            <div style={sContainer}>
              <h2
                style={{
                  ...sSection,
                  fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                  color: colors.text,
                }}
              >
                Why You'll Love It
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 24,
                }}
              >
                {config.benefits.map((b: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: 28,
                      background: colors.surface,
                      borderRadius: themeStyles.cardRadius,
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 14 }}>
                      {b.icon}
                    </div>
                    <h3
                      style={{
                        fontFamily: `'${fonts.heading}', sans-serif`,
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        marginBottom: 8,
                      }}
                    >
                      {b.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: colors.textMuted,
                        lineHeight: 1.6,
                      }}
                    >
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case "features":
        return product.features?.length > 0 ? (
          <section
            key="features"
            style={{
              padding: "60px 0",
              borderTop: `1px solid ${colors.surface}`,
              borderBottom: `1px solid ${colors.surface}`,
            }}
          >
            <div style={{ ...sContainer, maxWidth: 680 }}>
              <h2
                style={{
                  ...sSection,
                  fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                  color: colors.text,
                }}
              >
                Product Features
              </h2>
              <div style={{ display: "grid", gap: 14 }}>
                {product.features.map((f: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 20px",
                      background: colors.surface,
                      borderRadius: themeStyles.itemRadius,
                    }}
                  >
                    <ShieldCheck
                      size={18}
                      style={{ color: colors.primary, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.92rem" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case "testimonials":
        return config.testimonials?.length > 0 ? (
          <TestimonialsSection
            key="testimonials"
            testimonials={config.testimonials}
            colors={colors}
            fonts={fonts}
            layout={layouts.testimonials}
            theme={theme}
          />
        ) : null;

      case "comparison":
        return config.comparison?.enabled ? (
          <ComparisonSection
            key="comparison"
            comparison={config.comparison}
            colors={colors}
            fonts={fonts}
            theme={theme}
          />
        ) : null;

      case "gallery":
        return config.gallery?.enabled ? (
          <GallerySection
            key="gallery"
            gallery={config.gallery}
            colors={colors}
            fonts={fonts}
            theme={theme}
          />
        ) : null;

      case "faq":
        return config.faq?.length > 0 ? (
          <section
            key="faq"
            style={{
              padding: "80px 0",
              borderTop: `1px solid ${colors.surface}`,
            }}
          >
            <div style={{ ...sContainer, maxWidth: 680 }}>
              <h2
                style={{
                  ...sSection,
                  fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                  color: colors.text,
                }}
              >
                Frequently Asked Questions
              </h2>
              <div style={{ display: "grid", gap: 12 }}>
                {config.faq.map((f: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: colors.surface,
                      borderRadius: themeStyles.itemRadius,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 22px",
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        textAlign: "left",
                        color: colors.text,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {f.question}
                      {openFaq === i ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                    {openFaq === i && (
                      <div
                        style={{
                          padding: "0 22px 18px",
                          fontSize: "0.88rem",
                          color: colors.textMuted,
                          lineHeight: 1.7,
                        }}
                      >
                        {f.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case "finalCta":
        return (
          <section
            key="finalCta"
            style={{ padding: "80px 0", textAlign: "center" }}
          >
            <div style={sContainer}>
              <h2
                style={{
                  fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                  fontSize: "2rem",
                  fontWeight: 800,
                  marginBottom: 16,
                  color: colors.text,
                }}
              >
                Ready to order?
              </h2>
              <p
                style={{
                  color: colors.textMuted,
                  marginBottom: 32,
                  fontSize: "1rem",
                }}
              >
                Join thousands of happy customers. Order now and get free
                shipping.
              </p>
              <button
                style={{
                  ...sCta,
                  background: colors.primary,
                  color: colors.background,
                  borderRadius: themeStyles.ctaRadius,
                }}
              >
                <ShoppingCart size={18} /> {config.hero.ctaText}
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* ── Admin toolbar ────────────────────────────────── */}
      <div style={toolbar}>
        <button onClick={() => navigate(-1)} style={toolbarBtn}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={themeBadge}>{theme}</span>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {config.storeName}
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{ ...toolbarBtn, color: "var(--secondary)" }}
            onClick={() => setShowDomainSelector(!showDomainSelector)}
          >
            <Globe size={16} />{" "}
            {store.customDomain || purchasedDomain ? "Domain" : "Get Domain"}
          </button>
          <button
            style={{ ...toolbarBtn, color: "var(--primary)" }}
            onClick={() => togglePublish({ storeId: store._id })}
          >
            <ExternalLink size={16} />{" "}
            {store.published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Domain Selector Panel ────────────────────────── */}
      {showDomainSelector && (
        <div style={domainPanel}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {store.customDomain || purchasedDomain ? (
              <div style={connectedDomain}>
                <Globe size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <p style={{ fontWeight: 600 }}>Connected Domain</p>
                  <p style={{ color: "var(--primary)", fontSize: "1.1rem" }}>
                    {store.customDomain || purchasedDomain}
                  </p>
                </div>
              </div>
            ) : (
              <DomainSelector
                storeId={store._id}
                suggestedDomains={store.suggestedDomains || []}
                onDomainPurchased={(domain) => {
                  setPurchasedDomain(domain);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Generated Store ──────────────────────────────── */}
      <div
        style={{
          ...storeVars,
          fontFamily: `'${fonts.body}', sans-serif`,
          background: colors.background,
          color: colors.text,
        }}
      >
        <link
          href={`https://fonts.googleapis.com/css2?family=${fonts.heading.replace(/ /g, "+")}:wght@400;600;700;800;900&family=${fonts.body.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`}
          rel="stylesheet"
        />

        {/* ── Store Nav ──────────────────────────────────── */}
        <nav style={{ ...sNav, borderBottom: `1px solid ${colors.surface}` }}>
          <div style={sContainer}>
            <h2
              style={{
                fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                fontWeight: 800,
                fontSize: "1.3rem",
                letterSpacing: "-0.02em",
              }}
            >
              {config.storeName}
            </h2>
            <span style={{ fontSize: "0.85rem", color: colors.textMuted }}>
              {config.tagline}
            </span>
          </div>
        </nav>

        {/* ── Dynamic Sections ───────────────────────────── */}
        {sectionOrder.map((sectionId: string) => renderSection(sectionId))}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer
          style={{
            padding: "32px 0",
            borderTop: `1px solid ${colors.surface}`,
            textAlign: "center",
          }}
        >
          <div style={sContainer}>
            <p style={{ fontSize: "0.8rem", color: colors.textMuted }}>
              {config.footer?.copyright}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                marginTop: 12,
              }}
            >
              {config.footer?.links?.map((l: any, i: number) => (
                <a
                  key={i}
                  href={l.href}
                  style={{ fontSize: "0.78rem", color: colors.textMuted }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Theme-specific style generator
function getThemeStyles(theme: string, colors: any) {
  switch (theme) {
    case "luxury":
      return {
        headingFallback: "serif",
        cardRadius: 8,
        itemRadius: 8,
        ctaRadius: 4,
      };
    case "playful":
      return {
        headingFallback: "sans-serif",
        cardRadius: 24,
        itemRadius: 16,
        ctaRadius: 999,
      };
    case "bold":
      return {
        headingFallback: "sans-serif",
        cardRadius: 16,
        itemRadius: 12,
        ctaRadius: 12,
      };
    case "natural":
      return {
        headingFallback: "serif",
        cardRadius: 20,
        itemRadius: 16,
        ctaRadius: 24,
      };
    default: // minimal
      return {
        headingFallback: "sans-serif",
        cardRadius: 16,
        itemRadius: 12,
        ctaRadius: 999,
      };
  }
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const sContainer: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "0 24px",
};

const sNav: React.CSSProperties = {
  padding: "16px 0",
  display: "flex",
  alignItems: "center",
};

const sSection: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 800,
  textAlign: "center",
  marginBottom: 48,
  letterSpacing: "-0.02em",
};

const sCta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "16px 40px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  border: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const toolbar: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 24px",
  background: "rgba(6,6,11,0.92)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid var(--border)",
};

const toolbarBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  cursor: "pointer",
  background: "none",
  border: "none",
};

const themeBadge: React.CSSProperties = {
  padding: "4px 10px",
  background: "var(--primary-dim)",
  color: "var(--primary)",
  borderRadius: 6,
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const domainPanel: React.CSSProperties = {
  padding: "24px",
  background: "var(--bg)",
  borderBottom: "1px solid var(--border)",
};

const connectedDomain: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "20px 24px",
  background: "var(--surface)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--primary)",
};
