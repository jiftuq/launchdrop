import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Globe,
  Check,
  X,
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ConnectDomainProps {
  storeId: Id<"stores">;
  onDomainConnected?: (domain: string) => void;
}

type Step = "input" | "dns" | "verifying" | "success" | "error";

export default function ConnectDomain({
  storeId,
  onDomainConnected,
}: ConnectDomainProps) {
  const [domain, setDomain] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [domainId, setDomainId] = useState<Id<"domains"> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const createDomainSuggestion = useMutation(api.domains.createDomainSuggestion);
  const addCustomHostname = useAction(api.cloudflare.addCustomHostname);
  const verifyAndActivate = useAction(api.cloudflare.verifyAndActivateDomain);

  const CNAME_TARGET = "stores.launchdrop.app";

  const validateDomain = (d: string): boolean => {
    const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(d);
  };

  const handleSubmit = async () => {
    const cleanDomain = domain.toLowerCase().trim();

    if (!validateDomain(cleanDomain)) {
      setError("Please enter a valid domain (e.g., mystore.com)");
      return;
    }

    setError(null);
    setStep("dns");

    try {
      // Create domain entry in database
      const newDomainId = await createDomainSuggestion({
        storeId,
        domainName: cleanDomain,
      });
      setDomainId(newDomainId);
    } catch (err: any) {
      setError(err.message || "Failed to save domain");
      setStep("error");
    }
  };

  const handleVerify = async () => {
    if (!domainId) return;

    setStep("verifying");
    setError(null);

    try {
      // Add to Cloudflare and verify
      const result = await addCustomHostname({
        domainId,
        hostname: domain.toLowerCase().trim(),
        storeId,
      });

      if (result.success) {
        if (result.status === "active" || result.sslStatus === "active") {
          setStep("success");
          onDomainConnected?.(domain);
        } else {
          // Still pending - let user know
          setStep("dns");
          setError(
            `DNS verified but SSL is still ${result.sslStatus || "pending"}. This usually takes 1-5 minutes. Click "Verify" again to check.`
          );
        }
      } else {
        setError(result.error || "Verification failed");
        setStep("dns");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setStep("dns");
    }
  };

  const handleRetryVerify = async () => {
    if (!domainId) return;

    setStep("verifying");
    setError(null);

    try {
      const result = await verifyAndActivate({
        domainId,
        hostname: domain.toLowerCase().trim(),
        storeId,
      });

      if (result.success && result.status === "active") {
        setStep("success");
        onDomainConnected?.(domain);
      } else {
        setStep("dns");
        if (result.verificationErrors?.length) {
          setError(`DNS Error: ${result.verificationErrors.join(", ")}`);
        } else if (result.sslErrors?.length) {
          setError(`SSL Error: ${result.sslErrors.join(", ")}`);
        } else {
          setError(
            `Status: ${result.status || "pending"}. Make sure your DNS records are correct and try again in a few minutes.`
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setStep("dns");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Success state
  if (step === "success") {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={styles.successTitle}>Domain Connected!</h3>
          <p style={styles.successDomain}>{domain}</p>
          <p style={styles.successText}>
            Your store is now live at this domain. SSL certificate is active.
          </p>
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.visitLink}
          >
            <ExternalLink size={16} />
            Visit your store
          </a>
        </div>
      </div>
    );
  }

  // DNS Instructions step
  if (step === "dns" || step === "verifying") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Globe size={24} style={{ color: "var(--primary)" }} />
          <div>
            <h3 style={styles.title}>Connect {domain}</h3>
            <p style={styles.subtitle}>Add these DNS records at your domain registrar</p>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.dnsInstructions}>
          <p style={styles.instructionText}>
            Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these records:
          </p>

          <div style={styles.dnsRecord}>
            <div style={styles.recordHeader}>
              <span style={styles.recordType}>CNAME</span>
              <span style={styles.recordLabel}>Root Domain</span>
            </div>
            <div style={styles.recordRow}>
              <div style={styles.recordField}>
                <span style={styles.fieldLabel}>Name/Host</span>
                <div style={styles.fieldValue}>
                  <code>@</code>
                  <button
                    style={styles.copyBtn}
                    onClick={() => copyToClipboard("@", "host")}
                  >
                    {copied === "host" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div style={styles.recordField}>
                <span style={styles.fieldLabel}>Target/Value</span>
                <div style={styles.fieldValue}>
                  <code>{CNAME_TARGET}</code>
                  <button
                    style={styles.copyBtn}
                    onClick={() => copyToClipboard(CNAME_TARGET, "target")}
                  >
                    {copied === "target" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.dnsRecord}>
            <div style={styles.recordHeader}>
              <span style={styles.recordType}>CNAME</span>
              <span style={styles.recordLabel}>WWW Subdomain</span>
            </div>
            <div style={styles.recordRow}>
              <div style={styles.recordField}>
                <span style={styles.fieldLabel}>Name/Host</span>
                <div style={styles.fieldValue}>
                  <code>www</code>
                  <button
                    style={styles.copyBtn}
                    onClick={() => copyToClipboard("www", "www-host")}
                  >
                    {copied === "www-host" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div style={styles.recordField}>
                <span style={styles.fieldLabel}>Target/Value</span>
                <div style={styles.fieldValue}>
                  <code>{CNAME_TARGET}</code>
                  <button
                    style={styles.copyBtn}
                    onClick={() => copyToClipboard(CNAME_TARGET, "www-target")}
                  >
                    {copied === "www-target" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.note}>
            <p>
              <strong>Note:</strong> DNS changes can take up to 24 hours to propagate,
              but usually complete within 5-10 minutes.
            </p>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.secondaryBtn}
            onClick={() => {
              setStep("input");
              setError(null);
            }}
          >
            ← Change Domain
          </button>
          <button
            style={styles.primaryBtn}
            onClick={domainId ? handleRetryVerify : handleVerify}
            disabled={step === "verifying"}
          >
            {step === "verifying" ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Verify DNS & Connect
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Input step (default)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Globe size={24} style={{ color: "var(--primary)" }} />
        <div>
          <h3 style={styles.title}>Connect Your Domain</h3>
          <p style={styles.subtitle}>Use your own domain for this store</p>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.inputGroup}>
        <label style={styles.label}>Your Domain</label>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            placeholder="mystore.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={styles.input}
          />
        </div>
        <p style={styles.hint}>
          Enter your domain without http:// or www
        </p>
      </div>

      <button
        style={styles.primaryBtn}
        onClick={handleSubmit}
        disabled={!domain.trim()}
      >
        Continue <ArrowRight size={18} />
      </button>

      <div style={styles.features}>
        <div style={styles.feature}>
          <Check size={16} style={{ color: "var(--primary)" }} />
          <span>Free SSL certificate</span>
        </div>
        <div style={styles.feature}>
          <Check size={16} style={{ color: "var(--primary)" }} />
          <span>Automatic renewal</span>
        </div>
        <div style={styles.feature}>
          <Check size={16} style={{ color: "var(--primary)" }} />
          <span>Works with any registrar</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    padding: "24px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
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
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "rgba(255, 107, 61, 0.1)",
    border: "1px solid rgba(255, 107, 61, 0.3)",
    borderRadius: "var(--radius-md)",
    color: "var(--accent)",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "8px",
    color: "var(--text)",
  },
  inputWrapper: {
    position: "relative" as const,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontSize: "1rem",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  hint: {
    fontSize: "0.75rem",
    color: "var(--text-dim)",
    marginTop: "6px",
  },
  primaryBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 24px",
    background: "var(--primary)",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius-full)",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  features: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid var(--border)",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },

  // DNS Instructions
  dnsInstructions: {
    marginBottom: "24px",
  },
  instructionText: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    marginBottom: "20px",
    lineHeight: 1.6,
  },
  dnsRecord: {
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    marginBottom: "12px",
    overflow: "hidden",
  },
  recordHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  },
  recordType: {
    padding: "4px 10px",
    background: "var(--primary-dim)",
    color: "var(--primary)",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  recordLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  recordRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    padding: "16px",
  },
  recordField: {},
  fieldLabel: {
    display: "block",
    fontSize: "0.7rem",
    color: "var(--text-dim)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "6px",
  },
  fieldValue: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  copyBtn: {
    padding: "6px",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    borderRadius: "4px",
  },
  note: {
    padding: "12px 16px",
    background: "var(--primary-dim)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
  },

  // Success
  successBox: {
    textAlign: "center" as const,
    padding: "20px",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--primary)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  successTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    marginBottom: "8px",
  },
  successDomain: {
    fontSize: "1.1rem",
    color: "var(--primary)",
    fontWeight: 600,
    marginBottom: "12px",
  },
  successText: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    marginBottom: "20px",
  },
  visitLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "var(--primary)",
    color: "#000",
    borderRadius: "var(--radius-full)",
    fontSize: "0.9rem",
    fontWeight: 600,
    textDecoration: "none",
  },
};
