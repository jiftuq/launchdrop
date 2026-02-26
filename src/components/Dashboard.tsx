import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import {
  Plus,
  Eye,
  Trash2,
  Globe,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  // For demo, no auth — pass undefined to list all
  const stores = useQuery(api.stores.listStores, { userId: undefined }) ?? [];
  const deleteStore = useMutation(api.stores.deleteStore);
  const togglePublish = useMutation(api.stores.togglePublish);

  const statusConfig: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    scraping: {
      color: "#f0ad4e",
      icon: (
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      ),
      label: "Scraping",
    },
    analyzing: {
      color: "#7b61ff",
      icon: (
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      ),
      label: "Analyzing",
    },
    generating: {
      color: "#00e5a0",
      icon: (
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      ),
      label: "Generating",
    },
    ready: {
      color: "#00e5a0",
      icon: <CheckCircle2 size={14} />,
      label: "Ready",
    },
    error: {
      color: "#ff6b3d",
      icon: <AlertCircle size={14} />,
      label: "Error",
    },
  };

  return (
    <div className="grain" style={{ minHeight: "100vh" }}>
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div className="container" style={styles.navInner}>
          <div style={styles.logo} onClick={() => navigate("/")}>
            <div style={styles.logoIcon}>
              <Zap size={16} />
            </div>
            <span style={styles.logoText}>LaunchDrop</span>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "0.85rem" }}
            onClick={() => navigate("/")}
          >
            <Plus size={16} /> New Store
          </button>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <h1 style={styles.title}>Your Stores</h1>
        <p style={styles.subtitle}>Manage your AI-generated storefronts</p>

        {stores.length === 0 ? (
          <div style={styles.empty}>
            <Globe
              size={48}
              style={{ color: "var(--text-dim)", marginBottom: 16 }}
            />
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              No stores yet. Paste a product URL to create your first.
            </p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              <Plus size={18} /> Create Store
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {stores.map((store: Doc<"stores">) => {
              const status = statusConfig[store.status] || statusConfig.error;
              const config = store.storeConfig as any;
              const product = store.productData as any;

              return (
                <div key={store._id} style={styles.card}>
                  {/* Color bar */}
                  <div
                    style={{
                      height: 4,
                      borderRadius: "12px 12px 0 0",
                      background: config
                        ? `linear-gradient(90deg, ${config.colorScheme.primary}, ${config.colorScheme.secondary})`
                        : "var(--border)",
                    }}
                  />

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        {config?.storeName || "Generating…"}
                      </h3>
                      <div
                        style={{
                          ...styles.statusBadge,
                          color: status.color,
                          background: `${status.color}15`,
                        }}
                      >
                        {status.icon} {status.label}
                      </div>
                    </div>

                    {product && (
                      <p style={styles.cardProduct}>
                        {product.name} ·{" "}
                        {product.currency === "USD" ? "$" : product.currency}
                        {product.price}
                      </p>
                    )}

                    <p style={styles.cardUrl}>
                      <Globe size={12} />{" "}
                      {store.customDomain ||
                        `${store.subdomain}.launchdrop.app`}
                    </p>

                    {store.suggestedDomains &&
                      store.suggestedDomains.length > 0 &&
                      !store.customDomain && (
                        <div style={styles.domainHint}>
                          <span>Suggested: {store.suggestedDomains[0]}</span>
                        </div>
                      )}

                    <div style={styles.cardMeta}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={12} />
                        {new Date(store.createdAt).toLocaleDateString()}
                      </span>
                      {store.published && (
                        <span
                          style={{
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <ExternalLink size={12} /> Live
                        </span>
                      )}
                    </div>

                    <div style={styles.cardActions}>
                      {store.status === "ready" && (
                        <>
                          <button
                            style={styles.actionBtn}
                            onClick={() => navigate(`/preview/${store._id}`)}
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            style={{
                              ...styles.actionBtn,
                              color: store.published
                                ? "var(--accent)"
                                : "var(--primary)",
                            }}
                            onClick={() =>
                              togglePublish({ storeId: store._id })
                            }
                          >
                            <ExternalLink size={14} />{" "}
                            {store.published ? "Unpublish" : "Publish"}
                          </button>
                        </>
                      )}
                      <button
                        style={{
                          ...styles.actionBtn,
                          color: "var(--accent)",
                          marginLeft: "auto",
                        }}
                        onClick={() => {
                          if (confirm("Delete this store?"))
                            deleteStore({ storeId: store._id as Id<"stores"> });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "14px 0",
    background: "rgba(6,6,11,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border-subtle)",
  },
  navInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  logoText: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.1rem",
  },

  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 8,
  },
  subtitle: { color: "var(--text-muted)", fontSize: "1rem", marginBottom: 48 },

  empty: { textAlign: "center", padding: "80px 0" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 24,
  },

  card: {
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    overflow: "hidden",
    transition: "border-color 0.3s",
  },
  cardBody: { padding: "24px" },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.15rem",
    fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  cardProduct: {
    fontSize: "0.88rem",
    color: "var(--text-muted)",
    marginBottom: 8,
  },
  cardUrl: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.78rem",
    color: "var(--text-dim)",
    marginBottom: 16,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    fontSize: "0.78rem",
    color: "var(--text-dim)",
    marginBottom: 16,
  },
  cardActions: {
    display: "flex",
    gap: 8,
    paddingTop: 16,
    borderTop: "1px solid var(--border-subtle)",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    background: "var(--surface)",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  domainHint: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: "var(--primary-dim)",
    borderRadius: 6,
    fontSize: "0.75rem",
    color: "var(--primary)",
    marginBottom: 12,
  },
};
