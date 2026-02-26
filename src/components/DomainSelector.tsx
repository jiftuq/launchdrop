import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Globe,
  Check,
  X,
  Loader2,
  ShoppingCart,
  Sparkles,
  Shield,
  ExternalLink,
  Link2,
} from "lucide-react";
import ConnectDomain from "./ConnectDomain";

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  renewalPrice: number;
  premium: boolean;
}

interface DomainSelectorProps {
  storeId: Id<"stores">;
  suggestedDomains: string[];
  userId?: string;
  onDomainPurchased?: (domain: string) => void;
}

type TabType = "buy" | "connect";

export default function DomainSelector({
  storeId,
  suggestedDomains,
  userId,
  onDomainPurchased,
}: DomainSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("buy");
  const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const checkAvailability = useAction(
    api.domainActions.checkDomainAvailability,
  );
  const createDomainSuggestion = useMutation(
    api.domains.createDomainSuggestion,
  );
  const purchaseDomain = useAction(api.domainActions.purchaseDomain);

  useEffect(() => {
    if (suggestedDomains.length > 0) {
      checkDomains(suggestedDomains);
    }
  }, [suggestedDomains]);

  const checkDomains = async (domains: string[]) => {
    setChecking(true);
    try {
      const results = await checkAvailability({ domains });
      setDomainResults(results);
    } catch (err) {
      console.error("Failed to check domains:", err);
    }
    setChecking(false);
  };

  const handlePurchase = async (result: DomainResult) => {
    if (!result.available) return;

    setPurchasing(result.domain);
    try {
      // Create domain entry
      const domainId = await createDomainSuggestion({
        storeId,
        domainName: result.domain,
        userId,
      });

      // Process purchase
      await purchaseDomain({
        domainId,
        domainName: result.domain,
        storeId,
        userId,
      });

      setPurchaseSuccess(result.domain);
      onDomainPurchased?.(result.domain);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
    setPurchasing(null);
  };

  const handleCustomDomainCheck = () => {
    if (!customDomain.trim()) return;
    const domain = customDomain.toLowerCase().trim();
    if (!domain.includes(".")) return;
    checkDomains([domain, ...suggestedDomains.slice(0, 4)]);
    setShowCustomInput(false);
    setCustomDomain("");
  };

  if (purchaseSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>
          <Check size={32} />
        </div>
        <h3 style={styles.successTitle}>Domain Secured!</h3>
        <p style={styles.successDomain}>{purchaseSuccess}</p>
        <p style={styles.successText}>
          Your domain has been purchased and connected to your store. SSL
          certificate is being provisioned automatically.
        </p>
        <div style={styles.successBadges}>
          <span style={styles.badge}>
            <Shield size={14} /> SSL Active
          </span>
          <span style={styles.badge}>
            <Globe size={14} /> DNS Configured
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Globe size={20} />
        </div>
        <div>
          <h3 style={styles.title}>Get Your Domain</h3>
          <p style={styles.subtitle}>
            Buy a new domain or connect one you already own
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "buy" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("buy")}
        >
          <ShoppingCart size={16} />
          Buy Domain
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "connect" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("connect")}
        >
          <Link2 size={16} />
          Connect Your Own
        </button>
      </div>

      {/* Connect Your Own Domain Tab */}
      {activeTab === "connect" && (
        <ConnectDomain
          storeId={storeId}
          onDomainConnected={onDomainPurchased}
        />
      )}

      {/* Buy Domain Tab */}
      {activeTab === "buy" && (
        <>
          {checking ? (
            <div style={styles.loading}>
              <Loader2
                size={24}
                className="spin"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>Checking availability...</span>
            </div>
          ) : (
            <>
              <div style={styles.domainList}>
                {domainResults.map((result) => (
                  <div
                    key={result.domain}
                    style={{
                      ...styles.domainItem,
                      opacity: result.available ? 1 : 0.5,
                      borderColor: result.available
                        ? "var(--primary)"
                        : "var(--border)",
                    }}
                  >
                    <div style={styles.domainInfo}>
                      <div style={styles.domainName}>
                        {result.available ? (
                          <Check
                            size={16}
                            style={{ color: "var(--primary)" }}
                          />
                        ) : (
                          <X size={16} style={{ color: "var(--accent)" }} />
                        )}
                        <span>{result.domain}</span>
                        {result.premium && (
                          <span style={styles.premiumBadge}>
                            <Sparkles size={10} /> Premium
                          </span>
                        )}
                      </div>
                      <div style={styles.domainPricing}>
                        {result.available ? (
                          <>
                            <span style={styles.price}>${result.price}</span>
                            <span style={styles.renewal}>
                              /first year • ${result.renewalPrice}/yr renewal
                            </span>
                          </>
                        ) : (
                          <span style={styles.unavailable}>Unavailable</span>
                        )}
                      </div>
                    </div>

                    {result.available && (
                      <button
                        style={styles.buyButton}
                        onClick={() => handlePurchase(result)}
                        disabled={purchasing !== null}
                      >
                        {purchasing === result.domain ? (
                          <Loader2
                            size={16}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Buy Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom domain input */}
              {showCustomInput ? (
                <div style={styles.customInputContainer}>
                  <input
                    type="text"
                    placeholder="yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCustomDomainCheck()
                    }
                    style={styles.customInput}
                    autoFocus
                  />
                  <button
                    style={styles.checkButton}
                    onClick={handleCustomDomainCheck}
                  >
                    Check
                  </button>
                  <button
                    style={styles.cancelButton}
                    onClick={() => setShowCustomInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  style={styles.customDomainLink}
                  onClick={() => setShowCustomInput(true)}
                >
                  <ExternalLink size={14} />
                  Search for a different domain
                </button>
              )}

              {/* Pricing info */}
              <div style={styles.pricingInfo}>
                <p>
                  <strong>What's included:</strong>
                </p>
                <ul style={styles.featureList}>
                  <li>Free SSL certificate (auto-renewed)</li>
                  <li>Instant DNS configuration</li>
                  <li>Connected to your store automatically</li>
                  <li>24/7 domain monitoring</li>
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    padding: "24px",
    marginTop: "24px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: "var(--radius-md)",
    background: "var(--primary-dim)",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    padding: "4px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
  },
  tab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 600,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "40px",
    color: "var(--text-muted)",
  },
  domainList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  domainItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    transition: "border-color 0.2s",
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "4px",
  },
  premiumBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    background: "linear-gradient(135deg, #ffd700, #ffaa00)",
    color: "#000",
    borderRadius: "var(--radius-full)",
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
  },
  domainPricing: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },
  price: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--primary)",
  },
  renewal: {
    fontSize: "0.75rem",
    color: "var(--text-dim)",
  },
  unavailable: {
    fontSize: "0.85rem",
    color: "var(--text-dim)",
  },
  buyButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "var(--primary)",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  customDomainLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "16px",
    padding: "0",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    cursor: "pointer",
    textDecoration: "underline",
  },
  customInputContainer: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  customInput: {
    flex: 1,
    padding: "10px 16px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text)",
    fontSize: "0.9rem",
    outline: "none",
  },
  checkButton: {
    padding: "10px 20px",
    background: "var(--primary)",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 16px",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  pricingInfo: {
    marginTop: "24px",
    padding: "16px",
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  featureList: {
    margin: "8px 0 0 0",
    paddingLeft: "20px",
    lineHeight: 1.8,
  },
  successContainer: {
    textAlign: "center" as const,
    padding: "40px 24px",
    background: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--primary)",
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--primary)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  successTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    marginBottom: "8px",
  },
  successDomain: {
    fontSize: "1.1rem",
    color: "var(--primary)",
    fontWeight: 600,
    marginBottom: "16px",
  },
  successText: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    maxWidth: "320px",
    margin: "0 auto 20px",
    lineHeight: 1.6,
  },
  successBadges: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "var(--primary-dim)",
    color: "var(--primary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
};
