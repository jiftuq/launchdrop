import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Loader2,
  Globe,
  Sparkles,
  Paintbrush,
  Check,
  AlertTriangle,
  ArrowRight,
  Eye,
} from "lucide-react";

const STEPS = [
  {
    key: "scraping",
    icon: Globe,
    label: "Scraping product page",
    sub: "Extracting content from the product URL…",
  },
  {
    key: "analyzing",
    icon: Sparkles,
    label: "Analyzing product",
    sub: "Claude is identifying features, pricing, and audience…",
  },
  {
    key: "generating",
    icon: Paintbrush,
    label: "Generating your store",
    sub: "Crafting branding, copy, testimonials, and layout…",
  },
  {
    key: "ready",
    icon: Check,
    label: "Store ready!",
    sub: "Your AI-built storefront is live.",
  },
];

export default function StoreBuilder() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const triggered = useRef(false);

  const store = useQuery(api.stores.getStore, {
    storeId: storeId as Id<"stores">,
  });

  const generateStore = useAction(api.generateStore.generateStore);

  // Trigger generation once on mount
  useEffect(() => {
    if (!store || triggered.current) return;
    if (store.status === "scraping") {
      triggered.current = true;
      generateStore({
        storeId: storeId as Id<"stores">,
        productUrl: store.productUrl,
      });
    }
  }, [store, storeId, generateStore]);

  const currentStepIdx = STEPS.findIndex((s) => s.key === store?.status);

  return (
    <div className="grain" style={styles.page}>
      <div style={styles.orbLeft} />
      <div style={styles.orbRight} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <Sparkles size={20} />
          </div>
          <h1 style={styles.title}>Building Your Store</h1>
          {store && (
            <p style={styles.urlBadge}>
              <Globe size={14} />
              {store.productUrl.slice(0, 60)}
              {store.productUrl.length > 60 ? "…" : ""}
            </p>
          )}
        </div>

        {/* Steps */}
        <div style={styles.steps}>
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStepIdx;
            const isDone = i < currentStepIdx;
            const isError = store?.status === "error" && i === currentStepIdx;

            return (
              <div
                key={step.key}
                style={{
                  ...styles.step,
                  opacity: isDone || isActive ? 1 : 0.35,
                }}
              >
                <div
                  style={{
                    ...styles.stepIcon,
                    background: isDone
                      ? "var(--primary)"
                      : isActive
                        ? "var(--primary-dim)"
                        : "var(--surface)",
                    color: isDone
                      ? "#06060b"
                      : isActive
                        ? "var(--primary)"
                        : "var(--text-dim)",
                    ...(isActive && !isDone
                      ? {
                          boxShadow: "0 0 24px rgba(0,229,160,0.25)",
                        }
                      : {}),
                  }}
                >
                  {isDone ? (
                    <Check size={18} />
                  ) : isActive && !isError ? (
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : isError ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
                <div>
                  <p style={styles.stepLabel}>{step.label}</p>
                  {isActive && (
                    <p style={styles.stepSub}>
                      {isError ? store?.errorMessage : step.sub}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connector lines */}
        {store?.status === "error" && (
          <div style={styles.errorBox}>
            <AlertTriangle size={16} />
            <span>{store.errorMessage || "Something went wrong."}</span>
            <button
              className="btn-secondary"
              style={{ marginLeft: "auto", padding: "8px 20px", fontSize: "0.85rem" }}
              onClick={() => navigate("/")}
            >
              Try again
            </button>
          </div>
        )}

        {/* Ready state */}
        {store?.status === "ready" && (
          <div style={styles.readyBox}>
            <div style={styles.readyCheck}>
              <Check size={32} />
            </div>
            <h2 style={styles.readyTitle}>
              {store.storeConfig?.storeName || "Your Store"} is ready!
            </h2>
            <p style={styles.readySub}>
              Your AI-generated store has been created with custom branding,
              optimized copy, and conversion-focused layout.
            </p>
            <div style={styles.readyActions}>
              <button
                className="btn-primary"
                onClick={() => navigate(`/preview/${storeId}`)}
              >
                <Eye size={18} /> Preview Store
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  orbLeft: {
    position: "absolute",
    top: "10%",
    left: "-10%",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,160,0.06), transparent 60%)",
    pointerEvents: "none" as const,
  },
  orbRight: {
    position: "absolute",
    bottom: "10%",
    right: "-10%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(123,97,255,0.05), transparent 60%)",
    pointerEvents: "none" as const,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 560,
    padding: "48px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "40px",
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    marginBottom: 20,
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.6rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 12,
  },
  urlBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    background: "var(--surface)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.78rem",
    color: "var(--text-dim)",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  steps: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "opacity 0.4s",
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.4s",
  },
  stepLabel: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  stepSub: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginTop: 2,
  },

  errorBox: {
    marginTop: 28,
    padding: "16px 20px",
    background: "rgba(255,107,61,0.08)",
    border: "1px solid rgba(255,107,61,0.2)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: "0.85rem",
    color: "var(--accent)",
  },

  readyBox: {
    marginTop: 40,
    textAlign: "center" as const,
  },
  readyCheck: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--primary)",
    color: "#06060b",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 0 40px rgba(0,229,160,0.3)",
  },
  readyTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.5rem",
    fontWeight: 800,
    marginBottom: 10,
  },
  readySub: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    marginBottom: 28,
    maxWidth: 400,
    margin: "0 auto 28px",
    lineHeight: 1.6,
  },
  readyActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
};
