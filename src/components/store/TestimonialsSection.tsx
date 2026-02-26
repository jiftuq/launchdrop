import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  verified: boolean;
  title?: string;
  image?: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  colors: any;
  fonts: any;
  layout: "cards" | "carousel" | "stacked" | "minimal" | "featured";
  theme: string;
}

export default function TestimonialsSection({
  testimonials,
  colors,
  fonts,
  layout,
  theme,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const themeStyles = getThemeStyles(theme, colors);

  const renderStars = (rating: number) => (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={16} fill={colors.primary} color={colors.primary} />
      ))}
    </div>
  );

  const renderAvatar = (t: Testimonial) => (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `${colors.primary}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.9rem",
        color: colors.primary,
        overflow: "hidden",
      }}
    >
      {t.image || t.avatar ? (
        <img
          src={t.image || t.avatar}
          alt={t.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        t.name.charAt(0)
      )}
    </div>
  );

  // Carousel layout
  if (layout === "carousel") {
    const t = testimonials[currentIndex];
    return (
      <section style={{ padding: "80px 0" }}>
        <div style={styles.container}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
              color: colors.text,
            }}
          >
            What Customers Say
          </h2>
          <div style={{ ...styles.carouselWrapper, background: colors.surface }}>
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i === 0 ? testimonials.length - 1 : i - 1
                )
              }
              style={{ ...styles.carouselBtn, color: colors.textMuted }}
            >
              <ChevronLeft size={24} />
            </button>
            <div style={styles.carouselContent}>
              {renderStars(t.rating)}
              <p
                style={{
                  ...styles.carouselText,
                  color: colors.textMuted,
                }}
              >
                "{t.text}"
              </p>
              <div style={styles.carouselAuthor}>
                {renderAvatar(t)}
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", color: colors.text }}>
                    {t.name}
                  </p>
                  {t.verified && (
                    <p style={{ fontSize: "0.75rem", color: colors.primary }}>
                      ✓ Verified Buyer
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  i === testimonials.length - 1 ? 0 : i + 1
                )
              }
              style={{ ...styles.carouselBtn, color: colors.textMuted }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div style={styles.carouselDots}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  ...styles.dot,
                  background: i === currentIndex ? colors.primary : colors.surface,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Stacked layout
  if (layout === "stacked") {
    return (
      <section style={{ padding: "80px 0" }}>
        <div style={{ ...styles.container, maxWidth: 700 }}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
              color: colors.text,
            }}
          >
            What Customers Say
          </h2>
          <div style={styles.stackedList}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  ...styles.stackedItem,
                  borderLeft: `4px solid ${colors.primary}`,
                  background: colors.surface,
                }}
              >
                <Quote
                  size={32}
                  style={{ color: colors.primary, opacity: 0.3, marginBottom: 12 }}
                />
                <p
                  style={{
                    ...styles.stackedText,
                    color: colors.text,
                  }}
                >
                  {t.text}
                </p>
                <div style={styles.stackedAuthor}>
                  {renderStars(t.rating)}
                  <span style={{ color: colors.textMuted, fontSize: "0.9rem" }}>
                    — {t.name}
                    {t.verified && (
                      <span style={{ color: colors.primary }}> ✓</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Minimal layout
  if (layout === "minimal") {
    return (
      <section style={{ padding: "60px 0", borderTop: `1px solid ${colors.surface}` }}>
        <div style={styles.container}>
          <div style={styles.minimalGrid}>
            {testimonials.map((t, i) => (
              <div key={i} style={styles.minimalItem}>
                {renderStars(t.rating)}
                <p style={{ ...styles.minimalText, color: colors.textMuted }}>
                  "{t.text}"
                </p>
                <div style={styles.minimalAuthor}>
                  {renderAvatar(t)}
                  <span style={{ fontSize: "0.85rem", color: colors.text }}>
                    {t.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Featured layout
  if (layout === "featured") {
    const [featured, ...rest] = testimonials;
    return (
      <section style={{ padding: "80px 0" }}>
        <div style={styles.container}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
              color: colors.text,
            }}
          >
            What Customers Say
          </h2>
          {/* Featured testimonial */}
          <div
            style={{
              ...styles.featuredCard,
              background: `linear-gradient(135deg, ${colors.primary}11, ${colors.secondary}11)`,
              border: `1px solid ${colors.primary}33`,
            }}
          >
            <div style={styles.featuredContent}>
              {renderStars(featured.rating)}
              <p
                style={{
                  ...styles.featuredText,
                  fontFamily: `'${fonts.heading}', serif`,
                  color: colors.text,
                }}
              >
                "{featured.text}"
              </p>
              <div style={styles.featuredAuthor}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${colors.primary}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: colors.primary,
                  }}
                >
                  {featured.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "1.05rem", color: colors.text }}>
                    {featured.name}
                  </p>
                  {featured.title && (
                    <p style={{ fontSize: "0.85rem", color: colors.textMuted }}>
                      {featured.title}
                    </p>
                  )}
                  {featured.verified && (
                    <p style={{ fontSize: "0.75rem", color: colors.primary }}>
                      ✓ Verified Buyer
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Other testimonials */}
          <div style={styles.featuredGrid}>
            {rest.map((t, i) => (
              <div key={i} style={{ ...styles.card, background: colors.surface }}>
                {renderStars(t.rating)}
                <p style={{ ...styles.cardText, color: colors.textMuted }}>
                  "{t.text}"
                </p>
                <div style={styles.cardAuthor}>
                  {renderAvatar(t)}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", color: colors.text }}>
                      {t.name}
                    </p>
                    {t.verified && (
                      <p style={{ fontSize: "0.72rem", color: colors.primary }}>
                        ✓ Verified Buyer
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: Cards layout
  return (
    <section style={{ padding: "80px 0" }}>
      <div style={styles.container}>
        <h2
          style={{
            ...styles.sectionTitle,
            fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
            color: colors.text,
          }}
        >
          What Customers Say
        </h2>
        <div style={styles.cardsGrid}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                background: colors.surface,
                ...themeStyles.card,
              }}
            >
              {renderStars(t.rating)}
              <p style={{ ...styles.cardText, color: colors.textMuted }}>
                "{t.text}"
              </p>
              <div style={styles.cardAuthor}>
                {renderAvatar(t)}
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem", color: colors.text }}>
                    {t.name}
                  </p>
                  {t.verified && (
                    <p style={{ fontSize: "0.72rem", color: colors.primary }}>
                      ✓ Verified Buyer
                    </p>
                  )}
                </div>
              </div>
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
        card: { borderRadius: 8 },
      };
    case "playful":
      return {
        headingFallback: "sans-serif",
        card: { borderRadius: 24 },
      };
    case "bold":
      return {
        headingFallback: "sans-serif",
        card: { borderRadius: 16, border: `2px solid ${colors.primary}22` },
      };
    default:
      return {
        headingFallback: "sans-serif",
        card: { borderRadius: 16 },
      };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 24px",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 48,
    letterSpacing: "-0.02em",
  },

  // Cards layout
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  card: {
    padding: 28,
    borderRadius: 16,
  },
  cardText: {
    fontSize: "0.92rem",
    lineHeight: 1.7,
    marginTop: 14,
    marginBottom: 16,
    fontStyle: "italic",
  },
  cardAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  // Carousel layout
  carouselWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "48px 32px",
    borderRadius: 20,
    maxWidth: 700,
    margin: "0 auto",
  },
  carouselBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
  },
  carouselContent: {
    flex: 1,
    textAlign: "center",
  },
  carouselText: {
    fontSize: "1.15rem",
    lineHeight: 1.7,
    margin: "20px 0 24px",
    fontStyle: "italic",
  },
  carouselAuthor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  carouselDots: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  // Stacked layout
  stackedList: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  stackedItem: {
    padding: 32,
    paddingLeft: 28,
    borderRadius: 12,
  },
  stackedText: {
    fontSize: "1.1rem",
    lineHeight: 1.7,
    marginBottom: 16,
  },
  stackedAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  // Minimal layout
  minimalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 32,
  },
  minimalItem: {
    textAlign: "center",
  },
  minimalText: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "12px 0",
  },
  minimalAuthor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  // Featured layout
  featuredCard: {
    padding: 48,
    borderRadius: 24,
    marginBottom: 32,
  },
  featuredContent: {
    maxWidth: 600,
    margin: "0 auto",
    textAlign: "center",
  },
  featuredText: {
    fontSize: "1.4rem",
    lineHeight: 1.6,
    margin: "24px 0 32px",
  },
  featuredAuthor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    textAlign: "left",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
  },
};
