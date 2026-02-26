import { Check, X } from "lucide-react";

interface ComparisonSectionProps {
  comparison: {
    enabled: boolean;
    title: string;
    us: { name: string; points: string[] };
    them: { name: string; points: string[] };
  };
  colors: any;
  fonts: any;
  theme: string;
}

export default function ComparisonSection({
  comparison,
  colors,
  fonts,
  theme,
}: ComparisonSectionProps) {
  if (!comparison.enabled) return null;

  const themeStyles = getThemeStyles(theme);

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
          {comparison.title}
        </h2>

        <div style={styles.comparisonGrid}>
          {/* Our product */}
          <div
            style={{
              ...styles.card,
              background: `linear-gradient(135deg, ${colors.primary}11, ${colors.primary}05)`,
              border: `2px solid ${colors.primary}`,
              borderRadius: themeStyles.borderRadius,
            }}
          >
            <div
              style={{
                ...styles.cardHeader,
                background: colors.primary,
                color: colors.background,
                borderRadius: `${themeStyles.borderRadius - 4}px ${themeStyles.borderRadius - 4}px 0 0`,
              }}
            >
              <span style={styles.cardTitle}>{comparison.us.name}</span>
              <span style={styles.recommended}>Recommended</span>
            </div>
            <div style={styles.cardBody}>
              {comparison.us.points.map((point, i) => (
                <div key={i} style={styles.point}>
                  <div
                    style={{
                      ...styles.iconWrapper,
                      background: `${colors.primary}22`,
                      color: colors.primary,
                    }}
                  >
                    <Check size={16} />
                  </div>
                  <span style={{ color: colors.text }}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div
            style={{
              ...styles.card,
              background: colors.surface,
              border: `1px solid ${colors.surface}`,
              borderRadius: themeStyles.borderRadius,
            }}
          >
            <div
              style={{
                ...styles.cardHeader,
                background: colors.surface,
                color: colors.textMuted,
              }}
            >
              <span style={styles.cardTitle}>{comparison.them.name}</span>
            </div>
            <div style={styles.cardBody}>
              {comparison.them.points.map((point, i) => (
                <div key={i} style={styles.point}>
                  <div
                    style={{
                      ...styles.iconWrapper,
                      background: `${colors.accent || "#ff6b6b"}22`,
                      color: colors.accent || "#ff6b6b",
                    }}
                  >
                    <X size={16} />
                  </div>
                  <span style={{ color: colors.textMuted }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getThemeStyles(theme: string) {
  switch (theme) {
    case "luxury":
      return { headingFallback: "serif", borderRadius: 8 };
    case "playful":
      return { headingFallback: "sans-serif", borderRadius: 24 };
    case "bold":
      return { headingFallback: "sans-serif", borderRadius: 16 };
    default:
      return { headingFallback: "sans-serif", borderRadius: 16 };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
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
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  card: {
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
  },
  recommended: {
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: 4,
  },
  cardBody: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  point: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: "0.95rem",
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
