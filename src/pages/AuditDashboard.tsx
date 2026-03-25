import { useState, useEffect, useRef } from "react";

type Screen = "landing" | "loading" | "success";

const WEBHOOK_URL = "https://hook.eu1.make.com/zseyn2kvo4vd9b9t0ve1by6tc2m0mjyf";

const STEPS = [
  "Researching digital presence...",
  "Analyzing platform metrics...",
  "Building strategic insights...",
  "Designing premium PDF report...",
  "Sending to your inbox...",
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
  const [statusMessage, setStatusMessage] = useState("");
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

    // Highlight the filled fields briefly
    const fields = new Set(["brandName", "website", "industry"]);
    setHighlightedFields(fields);
    setTimeout(() => setHighlightedFields(new Set()), 1200);

    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  async function handleSubmit() {
    if (!validate()) return;

    // Transition to loading screen immediately
    setScreen("loading");
    setActiveStep(0);
    setCompletedSteps([]);

    const brandName = formData.brandName.trim();
    const websiteURL = formData.website.trim();
    const industry = formData.industry.trim();
    const email = formData.email.trim();

    console.log({ brandName, websiteURL, industry, email });

    // Bypassing CORS Preflight by not using application/json
    const fetchPromise = fetch(WEBHOOK_URL, {
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
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("Webhook response:", text);
      })
      .catch((error) => {
        // Since we are awaiting it and Make might not return CORS headers 
        // on the response, it will likely throw a CORS read error.
        // But the data HAS been sent already.
        console.error("Webhook read error (expected if no CORS response headers):", error);
      });

    // Animate steps concurrently
    for (let i = 0; i < STEPS.length; i++) {
      await delay(i === 0 ? 800 : 1800);
      setActiveStep(i);
      if (i > 0) {
        setCompletedSteps((prev) => [...prev, i - 1]);
      }
    }

    // Wait a moment on the final step ("Sending to your inbox...")
    await delay(1800);
    
    // Ensure the webhook fetch completes before showing success
    await fetchPromise;

    setCompletedSteps((prev) => [...prev, STEPS.length - 1]);
    await delay(1200);

    // Show success Screen
    setScreen("success");
  }

  function handleReset() {
    setScreen("landing");
    setFormData({ brandName: "", website: "", industry: "", email: "" });
    setErrors({});
    setActiveStep(-1);
    setCompletedSteps([]);
    setSelectedBrand(null);
    setHighlightedFields(new Set());
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field !== "email") setSelectedBrand(null);
  }

  const isLoading = screen === "loading";
  const isSuccess = screen === "success";

  return (
    <>
      <Navbar />

      {/* Screen 1: Landing */}
      <div
        className="landing-screen screen"
        style={{
          display: screen === "landing" ? "flex" : "none",
          opacity: screen === "landing" ? 1 : 0,
        }}
      >
        <div className="hero">
          <p className="hero-eyebrow">DIGITAL INTELLIGENCE PLATFORM</p>
          <h1 className="hero-heading">
            Instant Digital
            <span className="hero-heading-gold">Marketing Audit</span>
          </h1>
          <p className="hero-subtext">
            Enter any brand. Get a complete 2-page premium audit report delivered to your inbox in under 60 seconds.
          </p>
        </div>

        {/* Try Sample Brands */}
        <div className="sample-brands-section">
          <p className="sample-brands-title">Try Sample Brands</p>
          <div className="sample-brands-grid">
            {sampleBrands.map((brand) => (
              <button
                key={brand.name}
                type="button"
                className={`brand-card${selectedBrand === brand.name ? " selected" : ""}`}
                onClick={() => handleSelectBrand(brand)}
              >
                <span className="brand-card-name">{brand.name}</span>
                <span className="brand-card-industry">{brand.industry}</span>
              </button>
            ))}
          </div>
        </div>

        <form ref={formRef} className="form-card" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="brandName">BRAND NAME</label>
            <input
              id="brandName"
              type="text"
              className={`form-input${errors.brandName ? " error" : ""}${highlightedFields.has("brandName") ? " filled-highlight" : ""}`}
              placeholder="e.g. DKRaj Jewels"
              value={formData.brandName}
              onChange={(e) => updateField("brandName", e.target.value)}
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
            />
            {errors.email && <p className="form-error-text visible">{errors.email}</p>}
          </div>

          <button 
            type="button" 
            className="btn-generate" 
            onClick={handleSubmit} 
          >
            GENERATE AUDIT REPORT →
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

      {/* Screen 2: Loading */}
      <div
        className="loading-screen"
        style={{
          display: isLoading ? "flex" : "none",
          opacity: isLoading ? 1 : 0,
        }}
      >
        <div className="spinner-container">
          <div className="spinner-ring" />
          <div className="spinner-ring-inner" />
          <div className="spinner-label">AI</div>
        </div>

        <h2 className="loading-heading">Generating Your Audit Report</h2>

        <div className="steps-list">
          {STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i);
            const isActive = activeStep === i && !isDone;
            return (
              <div
                key={i}
                className={`step-item${isDone ? " done" : isActive ? " active" : ""}`}
              >
                <div className="step-check">{isDone || isActive ? "✓" : ""}</div>
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {formData.brandName && (
          <p className="auditing-label">Auditing: {formData.brandName}</p>
        )}
      </div>

      {/* Screen 3: Success */}
      <div
        className="success-screen"
        style={{
          display: isSuccess ? "flex" : "none",
          opacity: isSuccess ? 1 : 0,
        }}
      >
        <ConfettiCanvas active={isSuccess} />

        <div className="checkmark-wrapper">
          {isSuccess && <CheckmarkSVG />}
        </div>

        <h2 className="success-heading">Report Delivered!</h2>

        <p className="success-subtext">
          Your audit report for <strong style={{ color: "var(--gold)" }}>{formData.brandName}</strong> has been sent to{" "}
          <strong style={{ color: "var(--silver-light)" }}>{formData.email}</strong>. Please check your inbox.
        </p>

        <div className="success-buttons">
          <button className="btn-another" onClick={handleReset}>
            GENERATE ANOTHER REPORT
          </button>
        </div>
      </div>
    </>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
