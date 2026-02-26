import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Zap,
  Globe,
  Palette,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
} from "lucide-react";

export default function Landing() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const createStore = useMutation(api.stores.createStore);

  const handleGenerate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const storeId = await createStore({ productUrl: url.trim() });
      navigate(`/build/${storeId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="grain" style={{ minHeight: "100vh" }}>
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div className="container" style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Zap size={18} />
            </div>
            <span style={styles.logoText}>LaunchDrop</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>
              Features
            </a>
            <a href="#how" style={styles.navLink}>
              How it works
            </a>
            <button
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.875rem" }}
              onClick={() => document.getElementById("url-input")?.focus()}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={styles.hero}>
        {/* Background gradient orbs */}
        <div style={styles.orbPrimary} />
        <div style={styles.orbSecondary} />

        <div
          className="container animate-fade-up"
          style={styles.heroContent}
        >
          <div style={styles.badge}>
            <Sparkles size={14} />
            <span>AI-Powered Store Generation</span>
          </div>

          <h1 style={styles.heroTitle}>
            Paste a link.
            <br />
            <span style={styles.heroGradient}>Get a store.</span>
          </h1>

          <p style={styles.heroSub}>
            Drop any product URL and our AI instantly builds a
            conversion-optimized storefront — custom branding, compelling copy,
            and ready to sell in under 60 seconds.
          </p>

          {/* ── URL Input ─────────────────────────────────── */}
          <div
            className="animate-fade-up stagger-2"
            style={styles.inputWrapper}
          >
            <div style={styles.inputContainer}>
              <Globe size={20} style={{ color: "var(--text-dim)" }} />
              <input
                id="url-input"
                type="url"
                placeholder="Paste any product URL — Amazon, AliExpress, Shopify…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                style={styles.urlInput}
              />
              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={loading || !url.trim()}
                style={{
                  ...styles.generateBtn,
                  opacity: loading || !url.trim() ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    Generate Store <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
            <p style={styles.inputHint}>
              Works with Amazon, AliExpress, Temu, Etsy, Shopify, and
              thousands more
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>
            Everything you need.{" "}
            <span style={{ color: "var(--text-muted)" }}>
              Nothing you don't.
            </span>
          </h2>

          <div style={styles.featureGrid}>
            {[
              {
                icon: <Sparkles size={24} />,
                title: "AI-Generated Branding",
                desc: "Unique store name, color scheme, and typography tailored to your product's niche and audience.",
                color: "var(--primary)",
              },
              {
                icon: <Palette size={24} />,
                title: "Conversion-Optimized",
                desc: "Every element — headlines, testimonials, urgency triggers — engineered by AI to maximize sales.",
                color: "var(--secondary)",
              },
              {
                icon: <Clock size={24} />,
                title: "60-Second Stores",
                desc: "From product link to live store in under a minute. No design skills, no coding, no templates.",
                color: "var(--accent)",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "Built-in Analytics",
                desc: "Track views, clicks, and conversions. Know exactly what's working and optimize in real-time.",
                color: "#00b4d8",
              },
              {
                icon: <ShoppingBag size={24} />,
                title: "Any Product Source",
                desc: "Amazon, AliExpress, Temu, Etsy — paste any product URL and we extract everything automatically.",
                color: "#f72585",
              },
              {
                icon: <Globe size={24} />,
                title: "Instant Publishing",
                desc: "One click to go live. Custom subdomain included, or connect your own domain.",
                color: "#ffd60a",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`animate-fade-up stagger-${i + 1}`}
                style={styles.featureCard}
              >
                <div
                  style={{
                    ...styles.featureIcon,
                    background: `${f.color}15`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how" style={styles.howSection}>
        <div className="container">
          <h2 style={styles.sectionTitle}>
            Three steps.{" "}
            <span style={{ color: "var(--primary)" }}>Zero friction.</span>
          </h2>

          <div style={styles.stepsGrid}>
            {[
              {
                num: "01",
                title: "Paste your product link",
                desc: "Find a product on any marketplace. Copy the URL. That's all the input we need.",
              },
              {
                num: "02",
                title: "AI builds your store",
                desc: "Claude analyzes the product, creates branding, writes compelling copy, and designs the layout.",
              },
              {
                num: "03",
                title: "Launch & start selling",
                desc: "Preview your store, tweak if you want, hit publish. Share the link and start making sales.",
              },
            ].map((step, i) => (
              <div key={i} style={styles.stepCard}>
                <span style={styles.stepNum}>{step.num}</span>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={styles.ctaSection}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            style={{
              ...styles.sectionTitle,
              fontSize: "2.5rem",
              marginBottom: "16px",
            }}
          >
            Ready to launch?
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              marginBottom: "40px",
            }}
          >
            Your first store is free. No credit card required.
          </p>
          <button
            className="btn-primary"
            style={{ fontSize: "1.1rem", padding: "18px 48px" }}
            onClick={() => document.getElementById("url-input")?.focus()}
          >
            Start Building <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Zap size={14} />
            </div>
            <span style={{ ...styles.logoText, fontSize: "1rem" }}>
              LaunchDrop
            </span>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
            © 2025 LaunchDrop. Powered by Claude AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "16px 0",
    background: "rgba(6,6,11,0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border-subtle)",
  },
  navInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: "var(--radius-sm)",
    background:
      "linear-gradient(135deg, var(--primary), var(--secondary))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  logoText: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.2rem",
    letterSpacing: "-0.02em",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  navLink: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "color 0.2s",
  },

  /* Hero */
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingTop: "180px",
    paddingBottom: "120px",
  },
  orbPrimary: {
    position: "absolute",
    top: "-200px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "800px",
    height: "800px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 60%)",
    pointerEvents: "none" as const,
  },
  orbSecondary: {
    position: "absolute",
    top: "100px",
    right: "-200px",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 60%)",
    pointerEvents: "none" as const,
  },
  heroContent: {
    position: "relative",
    textAlign: "center" as const,
    maxWidth: "780px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 18px",
    borderRadius: "var(--radius-full)",
    background: "var(--primary-dim)",
    color: "var(--primary)",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "32px",
  },
  heroTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "24px",
  },
  heroGradient: {
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: "1.15rem",
    color: "var(--text-muted)",
    maxWidth: "580px",
    margin: "0 auto 48px",
    lineHeight: 1.7,
  },

  /* URL Input */
  inputWrapper: { maxWidth: "680px", margin: "0 auto" },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 8px 8px 20px",
    background: "var(--surface)",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--border)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  urlInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    fontSize: "0.95rem",
    padding: "8px 0",
    outline: "none",
    color: "var(--text)",
  },
  generateBtn: {
    flexShrink: 0,
    padding: "12px 28px",
    fontSize: "0.9rem",
    whiteSpace: "nowrap" as const,
  },
  inputHint: {
    marginTop: "14px",
    fontSize: "0.8rem",
    color: "var(--text-dim)",
    textAlign: "center" as const,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2px solid rgba(6,6,11,0.2)",
    borderTopColor: "#06060b",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },

  /* Features */
  features: {
    padding: "120px 0",
    borderTop: "1px solid var(--border-subtle)",
  },
  sectionTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "2.2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textAlign: "center" as const,
    marginBottom: "64px",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  featureCard: {
    padding: "36px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    transition: "border-color 0.3s, transform 0.3s",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  featureTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.15rem",
    fontWeight: 700,
    marginBottom: "10px",
    letterSpacing: "-0.01em",
  },
  featureDesc: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    lineHeight: 1.7,
  },

  /* How it works */
  howSection: {
    padding: "120px 0",
    borderTop: "1px solid var(--border-subtle)",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
  },
  stepCard: { padding: "8px" },
  stepNum: {
    fontFamily: "var(--font-heading)",
    fontSize: "3rem",
    fontWeight: 900,
    background:
      "linear-gradient(135deg, var(--primary), var(--secondary))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    marginBottom: "16px",
  },
  stepTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.3rem",
    fontWeight: 700,
    marginBottom: "10px",
  },
  stepDesc: {
    color: "var(--text-muted)",
    fontSize: "0.95rem",
    lineHeight: 1.7,
  },

  /* CTA */
  ctaSection: {
    padding: "120px 0",
    borderTop: "1px solid var(--border-subtle)",
  },

  /* Footer */
  footer: {
    padding: "32px 0",
    borderTop: "1px solid var(--border-subtle)",
  },
  footerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
};
