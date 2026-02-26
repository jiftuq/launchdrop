import { useState, useEffect } from "react";

interface UrgencySectionProps {
  urgency: {
    stockText: string;
    offerText: string;
    timerEnabled: boolean;
    style?: "banner" | "floating" | "inline";
  };
  colors: any;
  fonts: any;
  theme: string;
}

export default function UrgencySection({
  urgency,
  colors,
  fonts,
  theme,
}: UrgencySectionProps) {
  const [timer, setTimer] = useState({ h: 2, m: 47, s: 33 });

  useEffect(() => {
    if (!urgency.timerEnabled) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [urgency.timerEnabled]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const style = urgency.style || "banner";

  const themeStyles = getThemeStyles(theme);

  // Floating style
  if (style === "floating") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: colors.accent || colors.primary,
          color: "#fff",
          padding: "16px 24px",
          borderRadius: themeStyles.borderRadius,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          maxWidth: 300,
        }}
      >
        <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 8 }}>
          {urgency.offerText}
        </p>
        {urgency.timerEnabled && (
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: pad(timer.h), label: "H" },
              { val: pad(timer.m), label: "M" },
              { val: pad(timer.s), label: "S" },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{t.val}</div>
                <div style={{ fontSize: "0.6rem", opacity: 0.8 }}>{t.label}</div>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: "0.75rem", opacity: 0.9, marginTop: 8 }}>
          {urgency.stockText}
        </p>
      </div>
    );
  }

  // Inline style (just text, no box)
  if (style === "inline") {
    return (
      <div
        style={{
          padding: "16px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: colors.accent || colors.primary,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {urgency.offerText} • {urgency.stockText}
          {urgency.timerEnabled && (
            <span style={{ marginLeft: 12, fontWeight: 800 }}>
              {pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}
            </span>
          )}
        </p>
      </div>
    );
  }

  // Default: Banner style
  return (
    <section
      style={{
        padding: "20px 0",
        background: `${colors.accent || colors.primary}12`,
        textAlign: "center",
      }}
    >
      <div style={styles.container}>
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            marginBottom: urgency.timerEnabled ? 8 : 0,
            color: colors.accent || colors.primary,
          }}
        >
          {urgency.offerText}
        </p>
        {urgency.timerEnabled && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {[
              { val: pad(timer.h), label: "HRS" },
              { val: pad(timer.m), label: "MIN" },
              { val: pad(timer.s), label: "SEC" },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 16px",
                  background: colors.surface,
                  borderRadius: themeStyles.timerRadius,
                  minWidth: 60,
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: `'${fonts.heading}', sans-serif`,
                    color: colors.text,
                  }}
                >
                  {t.val}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: colors.textMuted,
                    letterSpacing: "0.1em",
                  }}
                >
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: 10 }}>
          {urgency.stockText}
        </p>
      </div>
    </section>
  );
}

function getThemeStyles(theme: string) {
  switch (theme) {
    case "luxury":
      return { borderRadius: 4, timerRadius: 4 };
    case "playful":
      return { borderRadius: 20, timerRadius: 16 };
    case "bold":
      return { borderRadius: 12, timerRadius: 12 };
    default:
      return { borderRadius: 12, timerRadius: 10 };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 24px",
  },
};
