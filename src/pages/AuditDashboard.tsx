import { useState, useEffect, useRef } from "react";

type Screen = "landing" | "loading" | "success";

const WEBHOOK_URL = "https://hook.eu1.make.com/0bd9k3i3gbpfksur04wls662bf5rovxb";

const STEPS = [
  "Collecting Social Media Data",
  "Analyzing Website Performance",
  "Running SEO Audit",
  "Generating Final Reports",
];

const sampleBrands = [
  { name: "Nike", url: "https://www.nike.com", industry: "Sportswear" },
  { name: "Amazon", url: "https://www.amazon.com", industry: "E-commerce" },
  { name: "Apple", url: "https://www.apple.com", industry: "Technology" },
  { name: "Zara", url: "https://www.zara.com", industry: "Fashion Retail" },
  { name: "Starbucks", url: "https://www.starbucks.com", industry: "Food & Beverage" },
  { name: "Tesla", url: "https://www.tesla.com", industry: "Automotive & Energy" },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-audit">AUDIT</span>
        <span className="logo-ai"> AI</span>
      </div>
    </nav>
  );
}

function ConfettiCanvas({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    if (!active || createdRef.current || !containerRef.current) return;
    createdRef.current = true;
    const container = containerRef.current;

    const colors = ["#C9A84C", "#E2C87A", "#A07830", "#B8C0D0", "#D4DAE8", "#F0D080"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.backgroundColor = color;
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.width = `${4 + Math.random() * 8}px`;
      piece.style.height = `${4 + Math.random() * 8}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      const duration = 2.5 + Math.random() * 3;
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      container.appendChild(piece);
    }
  }, [active]);

  return <div className="confetti-container" ref={containerRef} />;
}

function CheckmarkSVG() {
  return (
    <svg className="checkmark-svg" viewBox="0 0 100 100">
      <circle className="checkmark-circle" cx="50" cy="50" r="40" />
      <circle className="checkmark-circle-animated" cx="50" cy="50" r="40" />
      <polyline
        className="checkmark-path"
        points="28,52 42,66 72,36"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FormData {
  brandName: string;
  website: string;
  industry: string;
  email: string;
}

interface FormErrors {
  brandName?: string;
  website?: string;
  industry?: string;
  email?: string;
}

export default function AuditDashboard() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [formData, setFormData] = useState<FormData>({
    brandName: "",
    website: "",
    industry: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  const [webhookError, setWebhookError] = useState("");
  const [reportLinks, setReportLinks] = useState({ full: "", seo: "" });

  const formRef = useRef<HTMLFormElement>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.brandName.trim()) newErrors.brandName = "Brand name is required";
    if (!formData.website.trim()) newErrors.website = "Website URL is required";
    if (!formData.industry.trim()) newErrors.industry = "Industry is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSelectBrand(brand: { name: string; url: string; industry: string }) {
    setSelectedBrand(brand.name);
    setFormData((prev) => ({
      ...prev,
      brandName: brand.name,
      website: brand.url,
      industry: brand.industry,
    }));
    setErrors((prev) => ({
      ...prev,
      brandName: undefined,
      website: undefined,
      industry: undefined,
    }));

    const fields = new Set(["brandName", "website", "industry"]);
    setHighlightedFields(fields);
    setTimeout(() => setHighlightedFields(new Set()), 1200);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  async function handleSubmit() {
    if (!validate()) return;

    setScreen("loading");
    setWebhookError("");
    setIsSending(true);
    setActiveStep(0);
    setCompletedSteps([]);

    const brandName = formData.brandName.trim();
    const websiteURL = formData.website.trim();
    const industry = formData.industry.trim();
    const email = formData.email.trim();

    let currentStep = 0;
    const maxLoadingSteps = STEPS.length - 1;

    // Start advancing steps while waiting for webhook
    const progressInterval = setInterval(() => {
      if (currentStep < maxLoadingSteps) {
        setCompletedSteps((prev) => [...prev, currentStep]);
        currentStep++;
        setActiveStep(currentStep);
      }
    }, 2500);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          company_name: brandName,
          company_url: websiteURL,
          industry: industry,
          recipient_email: email
        }).toString()
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const responseText = await res.text();
      let data: any = {};
      try {
        // Attempt to parse JSON if the webhook is configured to return it
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn("Webhook returned non-JSON response:", responseText);
      }
      
      setReportLinks({
        full: data?.full_report_url || "https://example.com/Make-Webhook-Did-Not-Return-URL",
        seo: data?.seo_report_url || "https://example.com/Make-Webhook-Did-Not-Return-URL"
      });

      clearInterval(progressInterval);

      // Fast-forward any remaining steps sequentially
      for (let i = currentStep; i < STEPS.length; i++) {
        setActiveStep(i);
        await new Promise(r => setTimeout(r, 600)); 
        setCompletedSteps(prev => [...prev, i]);
      }
      
      await new Promise(r => setTimeout(r, 600));
      
      setScreen("success");
    } catch (error) {
      console.error("Webhook error:", error);
      clearInterval(progressInterval);
      setWebhookError("Something went wrong. Please try again.");
      setScreen("landing");
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setScreen("landing");
    setFormData({ brandName: "", website: "", industry: "", email: "" });
    setErrors({});
    setActiveStep(-1);
    setCompletedSteps([]);
    setSelectedBrand(null);
    setHighlightedFields(new Set());
    setWebhookError("");
    setReportLinks({ full: "", seo: "" });
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field !== "email") setSelectedBrand(null);
  }

  return (
    <>
      <Navbar />

      {/* Screen 1: Landing */}
      {screen === "landing" && (
        <div className="landing-screen screen" style={{ display: "flex", opacity: 1 }}>
          <div className="hero">
            <p className="hero-eyebrow">DIGITAL INTELLIGENCE PLATFORM</p>
            <h1 className="hero-heading">
              Instant Digital
              <span className="hero-heading-gold"> Marketing Audit</span>
            </h1>
            <p className="hero-subtext">
              Enter any brand. Get a complete 2-page premium audit report delivered to your inbox in under 60 seconds.
            </p>
          </div>

          <div className="sample-brands-section">
            <p className="sample-brands-title">Try Sample Brands</p>
            <div className="sample-brands-grid">
              {sampleBrands.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  className={`brand-card${selectedBrand === brand.name ? " selected" : ""}`}
                  onClick={() => handleSelectBrand(brand)}
                  disabled={isSending}
                >
                  <span className="brand-card-name">{brand.name}</span>
                  <span className="brand-card-industry">{brand.industry}</span>
                </button>
              ))}
            </div>
          </div>

          <form ref={formRef} className="form-card" onSubmit={(e) => e.preventDefault()} noValidate>
            {webhookError && (
              <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-medium">
                {webhookError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="brandName">BRAND NAME</label>
              <input
                id="brandName"
                type="text"
                className={`form-input${errors.brandName ? " error" : ""}${highlightedFields.has("brandName") ? " filled-highlight" : ""}`}
                placeholder="e.g. DKRaj Jewels"
                value={formData.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                disabled={isSending}
              />
              {errors.brandName && <p className="form-error-text visible">{errors.brandName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="website">WEBSITE URL</label>
              <input
                id="website"
                type="text"
                className={`form-input${errors.website ? " error" : ""}${highlightedFields.has("website") ? " filled-highlight" : ""}`}
                placeholder="e.g. dkrajjewels.com"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                disabled={isSending}
              />
              {errors.website && <p className="form-error-text visible">{errors.website}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="industry">INDUSTRY</label>
              <input
                id="industry"
                type="text"
                className={`form-input${errors.industry ? " error" : ""}${highlightedFields.has("industry") ? " filled-highlight" : ""}`}
                placeholder="e.g. Luxury Silver Jewellery"
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                disabled={isSending}
              />
              {errors.industry && <p className="form-error-text visible">{errors.industry}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">RECIPIENT EMAIL</label>
              <input
                id="email"
                type="email"
                className={`form-input${errors.email ? " error" : ""}`}
                placeholder="Report will be sent here"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                disabled={isSending}
              />
              {errors.email && <p className="form-error-text visible">{errors.email}</p>}
            </div>

            <button 
              type="button" 
              className={`btn-generate transition-opacity duration-300 ${isSending ? "opacity-70 cursor-not-allowed" : ""}`} 
              onClick={handleSubmit} 
              disabled={isSending}
            >
              {isSending ? "PROCESSING..." : "GENERATE AUDIT REPORT →"}
            </button>

            <p className="powered-text">
              Powered by Gemini + Claude AI • Delivered via email in ~60 seconds
            </p>
          </form>

          <div className="badges-row">
            <div className="feature-badge">
              <span className="feature-badge-icon">◆</span>
              <span className="feature-badge-text">2-Page PDF Report</span>
            </div>
            <div className="feature-badge">
              <span className="feature-badge-icon">◆</span>
              <span className="feature-badge-text">Real-Time Data</span>
            </div>
            <div className="feature-badge">
              <span className="feature-badge-icon">◆</span>
              <span className="feature-badge-text">AI-Powered Analysis</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Reports Generated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">60sec</div>
              <div className="stat-label">Average Delivery</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Data Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Loading */}
      {screen === "loading" && (
        <div className="loading-screen" style={{ display: "flex", opacity: 1 }}>
          <div className="spinner-container">
            <div className="spinner-ring" />
            <div className="spinner-ring-inner" />
            <div className="spinner-label">AI</div>
          </div>

          <h2 className="loading-heading">Generating Your Audit Report...</h2>
          
          <p className="mt-2 text-[#a1a1aa] text-center text-sm md:text-base max-w-md mx-auto mb-8 px-4 leading-relaxed">
            Analyzing website, social media & SEO data. This may take 60–120 seconds.
          </p>

          <div className="steps-list">
            {STEPS.map((step, i) => {
              const isDone = completedSteps.includes(i);
              const isActive = activeStep === i && !isDone;
              
              let icon = "";
              if (isDone) icon = "✓";
              else if (isActive && i === STEPS.length - 1) icon = "⏳";
              else if (isActive || isDone) icon = "✓";

              return (
                <div
                  key={i}
                  className={`step-item${isDone ? " done" : isActive ? " active" : ""}`}
                >
                  <div className="step-check">{icon}</div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          {formData.brandName && (
            <p className="auditing-label mt-8 text-[#C9A84C]">Auditing: {formData.brandName}</p>
          )}
        </div>
      )}

      {/* Screen 3: Success */}
      {screen === "success" && (
        <div className="success-screen" style={{ display: "flex", opacity: 1 }}>
          <ConfettiCanvas active={screen === "success"} />

          <div className="checkmark-wrapper">
            <CheckmarkSVG />
          </div>

          <h2 className="success-heading">Report Delivered!</h2>

          <p className="success-subtext">
            Your audit report for <strong style={{ color: "var(--gold)" }}>{formData.brandName}</strong> has been sent to{" "}
            <strong style={{ color: "var(--silver-light)" }}>{formData.email}</strong>. Please check your inbox.
          </p>

          <p className="mt-6 text-[#a1a1aa] text-center text-sm md:text-base max-w-lg mx-auto">
            You will receive both reports in your inbox shortly.
          </p>

          <style>{`
            .report-buttons-container {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-top: 32px;
              margin-bottom: 12px;
              justify-content: center;
              width: 100%;
            }
            .report-link-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 14px 28px;
              border: 1px solid var(--gold, #C9A84C);
              color: var(--gold, #C9A84C);
              background: transparent;
              border-radius: 6px;
              font-family: inherit;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.5px;
              cursor: pointer;
              transition: all 0.3s ease;
              white-space: nowrap;
            }
            .report-link-btn:hover {
              background: var(--gold, #C9A84C);
              color: #0c1220;
              box-shadow: 0 4px 12px rgba(201, 168, 76, 0.2);
              transform: translateY(-1px);
            }
          `}</style>

          <div className="report-buttons-container">
            {reportLinks.full && (
              <button 
                className="report-link-btn"
                onClick={() => window.open(reportLinks.full, "_blank")}
              >
                View Full Audit (PDF)
              </button>
            )}
            
            {reportLinks.seo && (
              <button 
                className="report-link-btn"
                onClick={() => window.open(reportLinks.seo, "_blank")}
              >
                View SEO Report (PDF)
              </button>
            )}
          </div>

          <div className="success-buttons mt-10">
            <button className="btn-another" onClick={handleReset}>
              GENERATE ANOTHER REPORT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
