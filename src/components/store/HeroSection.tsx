import { useState } from "react";
import {
  ShoppingCart,
  Truck,
  RotateCcw,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HeroSectionProps {
  config: any;
  product: any;
  colors: any;
  fonts: any;
  layout: "centered" | "split" | "fullscreen" | "minimal" | "video-style";
  theme: string;
}

export default function HeroSection({
  config,
  product,
  colors,
  fonts,
  layout,
  theme,
}: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images || [];

  const trustBadges = [
    { icon: <Truck size={16} />, text: "Free Shipping" },
    { icon: <RotateCcw size={16} />, text: "30-Day Returns" },
    { icon: <Lock size={16} />, text: "Secure Checkout" },
  ];

  // Theme-specific adjustments
  const themeStyles = getThemeStyles(theme, colors);

  // Image gallery component
  const ProductImageGallery = () => {
    if (images.length === 0) {
      return (
        <div style={{ ...styles.imagePlaceholder, background: colors.surface }}>
          <ShoppingCart size={64} style={{ color: colors.textMuted }} />
        </div>
      );
    }

    return (
      <div style={styles.imageGallery}>
        <div style={styles.mainImageContainer}>
          {images.length > 1 && (
            <button
              onClick={() =>
                setCurrentImageIndex((i) =>
                  i === 0 ? images.length - 1 : i - 1,
                )
              }
              style={{
                ...styles.imageNavBtn,
                left: 8,
                background: `${colors.surface}ee`,
              }}
            >
              <ChevronLeft size={20} color={colors.text} />
            </button>
          )}
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            style={{
              ...styles.mainImage,
              borderRadius: themeStyles.imageRadius,
            }}
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {images.length > 1 && (
            <button
              onClick={() =>
                setCurrentImageIndex((i) =>
                  i === images.length - 1 ? 0 : i + 1,
                )
              }
              style={{
                ...styles.imageNavBtn,
                right: 8,
                background: `${colors.surface}ee`,
              }}
            >
              <ChevronRight size={20} color={colors.text} />
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div style={styles.thumbnailRow}>
            {images.slice(0, 5).map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                style={{
                  ...styles.thumbnail,
                  borderColor:
                    i === currentImageIndex ? colors.primary : "transparent",
                  borderRadius: themeStyles.thumbnailRadius,
                }}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  style={{
                    ...styles.thumbnailImg,
                    borderRadius: themeStyles.thumbnailRadius,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (layout === "split") {
    return (
      <section
        style={{
          ...styles.heroSplit,
          background: colors.background,
        }}
      >
        <div style={styles.splitContent}>
          <div style={styles.splitText}>
            {config.hero.badgeText && (
              <div
                style={{
                  ...styles.badge,
                  background: `${colors.primary}18`,
                  color: colors.primary,
                  ...themeStyles.badge,
                }}
              >
                {config.hero.badgeText}
              </div>
            )}
            <h1
              style={{
                ...styles.headlineSplit,
                fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                color: colors.text,
              }}
            >
              {config.hero.headline}
            </h1>
            <p
              style={{
                ...styles.subheadlineSplit,
                color: colors.textMuted,
              }}
            >
              {config.hero.subheadline}
            </p>
            <div style={styles.priceRow}>
              <span
                style={{
                  ...styles.price,
                  fontFamily: `'${fonts.heading}', sans-serif`,
                }}
              >
                {product.currency === "USD" ? "$" : product.currency}
                {product.price}
              </span>
            </div>
            <button
              style={{
                ...styles.cta,
                background: colors.primary,
                color: colors.background,
                ...themeStyles.cta,
              }}
            >
              <ShoppingCart size={18} /> {config.hero.ctaText}
            </button>
            <div style={styles.trustBadgesSplit}>
              {trustBadges.map((b, i) => (
                <div
                  key={i}
                  style={{ ...styles.trustBadge, color: colors.textMuted }}
                >
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.splitImage}>
            <ProductImageGallery />
          </div>
        </div>
      </section>
    );
  }

  if (layout === "fullscreen") {
    return (
      <section
        style={{
          ...styles.heroFullscreen,
          backgroundImage: config.hero.backgroundImage
            ? `url(${config.hero.backgroundImage})`
            : `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}22)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={styles.fullscreenOverlay}>
          <div style={styles.fullscreenContent}>
            {config.hero.badgeText && (
              <div
                style={{
                  ...styles.badge,
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
              >
                {config.hero.badgeText}
              </div>
            )}
            <h1
              style={{
                ...styles.headlineFullscreen,
                fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
                color: "#fff",
              }}
            >
              {config.hero.headline}
            </h1>
            <p
              style={{
                ...styles.subheadlineFullscreen,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {config.hero.subheadline}
            </p>
            <div style={{ ...styles.priceRow, justifyContent: "center" }}>
              <span style={{ ...styles.priceFullscreen, color: "#fff" }}>
                {product.currency === "USD" ? "$" : product.currency}
                {product.price}
              </span>
            </div>
            <button
              style={{
                ...styles.cta,
                background: "#fff",
                color: colors.primary,
                ...themeStyles.cta,
              }}
            >
              <ShoppingCart size={18} /> {config.hero.ctaText}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "minimal") {
    return (
      <section style={{ ...styles.heroMinimal, background: colors.background }}>
        <div style={styles.minimalContent}>
          <h1
            style={{
              ...styles.headlineMinimal,
              fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
              color: colors.text,
            }}
          >
            {config.hero.headline}
          </h1>
          <button
            style={{
              ...styles.ctaMinimal,
              background: colors.primary,
              color: colors.background,
              ...themeStyles.cta,
            }}
          >
            {config.hero.ctaText} →
          </button>
        </div>
      </section>
    );
  }

  // Default: centered layout
  return (
    <section
      style={{
        ...styles.heroCentered,
        background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
      }}
    >
      <div style={styles.centeredContent}>
        {config.hero.badgeText && (
          <div
            style={{
              ...styles.badge,
              background: `${colors.primary}18`,
              color: colors.primary,
              ...themeStyles.badge,
            }}
          >
            {config.hero.badgeText}
          </div>
        )}
        <h1
          style={{
            ...styles.headline,
            fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
            color: colors.text,
          }}
        >
          {config.hero.headline}
        </h1>
        <p style={{ ...styles.subheadline, color: colors.textMuted }}>
          {config.hero.subheadline}
        </p>

        {/* Product Image Gallery */}
        {images.length > 0 && (
          <div style={styles.centeredImageWrapper}>
            <ProductImageGallery />
          </div>
        )}

        <div style={styles.priceRow}>
          <span
            style={{
              ...styles.price,
              fontFamily: `'${fonts.heading}', sans-serif`,
            }}
          >
            {product.currency === "USD" ? "$" : product.currency}
            {product.price}
          </span>
        </div>
        <button
          style={{
            ...styles.cta,
            background: colors.primary,
            color: colors.background,
            ...themeStyles.cta,
          }}
        >
          <ShoppingCart size={18} /> {config.hero.ctaText}
        </button>
        <div style={styles.trustBadges}>
          {trustBadges.map((b, i) => (
            <div
              key={i}
              style={{ ...styles.trustBadge, color: colors.textMuted }}
            >
              {b.icon} {b.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getThemeStyles(theme: string, colors: any) {
  switch (theme) {
    case "luxury":
      return {
        headingFallback: "serif",
        badge: {
          borderRadius: 4,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
        },
        cta: { borderRadius: 4, letterSpacing: "0.05em" },
        imageRadius: 4,
        thumbnailRadius: 2,
      };
    case "playful":
      return {
        headingFallback: "sans-serif",
        badge: { borderRadius: 20, fontWeight: 700 },
        cta: { borderRadius: 30, fontWeight: 800 },
        imageRadius: 24,
        thumbnailRadius: 12,
      };
    case "bold":
      return {
        headingFallback: "sans-serif",
        badge: {
          borderRadius: 8,
          fontWeight: 800,
          textTransform: "uppercase" as const,
        },
        cta: { borderRadius: 12, fontWeight: 800, fontSize: "1.1rem" },
        imageRadius: 16,
        thumbnailRadius: 8,
      };
    case "natural":
      return {
        headingFallback: "serif",
        badge: { borderRadius: 16, background: `${colors.primary}22` },
        cta: { borderRadius: 24 },
        imageRadius: 20,
        thumbnailRadius: 10,
      };
    default: // minimal
      return {
        headingFallback: "sans-serif",
        badge: { borderRadius: 999 },
        cta: { borderRadius: 999 },
        imageRadius: 16,
        thumbnailRadius: 8,
      };
  }
}

const styles: Record<string, React.CSSProperties> = {
  // Centered layout
  heroCentered: {
    padding: "100px 0 80px",
  },
  centeredContent: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    padding: "8px 20px",
    borderRadius: 999,
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: 28,
  },
  headline: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    marginBottom: 20,
  },
  subheadline: {
    fontSize: "1.1rem",
    maxWidth: 560,
    margin: "0 auto 36px",
    lineHeight: 1.7,
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  price: {
    fontSize: "2.2rem",
    fontWeight: 800,
  },
  cta: {
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
  },
  trustBadges: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    marginTop: 28,
    flexWrap: "wrap",
  },
  trustBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.82rem",
  },

  // Split layout
  heroSplit: {
    padding: "80px 0",
  },
  splitContent: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
    alignItems: "center",
  },
  splitText: {
    textAlign: "left",
  },
  headlineSplit: {
    fontSize: "clamp(1.8rem, 4vw, 3rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    marginBottom: 20,
  },
  subheadlineSplit: {
    fontSize: "1.05rem",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  splitImage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    maxWidth: "100%",
    maxHeight: 500,
    objectFit: "contain",
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 400,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trustBadgesSplit: {
    display: "flex",
    gap: 24,
    marginTop: 24,
    flexWrap: "wrap",
  },

  // Fullscreen layout
  heroFullscreen: {
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  fullscreenOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenContent: {
    textAlign: "center",
    padding: "0 24px",
    maxWidth: 800,
  },
  headlineFullscreen: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: 24,
  },
  subheadlineFullscreen: {
    fontSize: "1.2rem",
    marginBottom: 32,
    lineHeight: 1.7,
  },
  priceFullscreen: {
    fontSize: "2.5rem",
    fontWeight: 800,
  },

  // Minimal layout
  heroMinimal: {
    padding: "160px 0",
  },
  minimalContent: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  headlineMinimal: {
    fontSize: "clamp(2.5rem, 6vw, 5rem)",
    fontWeight: 900,
    lineHeight: 1.02,
    letterSpacing: "-0.04em",
    marginBottom: 48,
  },
  ctaMinimal: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "20px 48px",
    fontSize: "1.1rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },

  // Image gallery styles
  centeredImageWrapper: {
    maxWidth: 500,
    margin: "0 auto 32px",
  },
  imageGallery: {
    width: "100%",
  },
  mainImageContainer: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  },
  imageNavBtn: {
    position: "absolute" as const,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "opacity 0.2s",
  },
  thumbnailRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  thumbnail: {
    width: 60,
    height: 60,
    padding: 0,
    border: "2px solid transparent",
    background: "none",
    cursor: "pointer",
    overflow: "hidden",
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
};
