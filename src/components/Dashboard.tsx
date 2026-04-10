import { useState, useEffect, useRef } from "react";

type Screen = "landing" | "loading" | "success";

const WEBHOOK_URL = "https://hook.eu1.make.com/q4vk1215h2j2str48xbowp2rwhecgxvv";

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

function Navbar({ onLogout }: { onLogout?: () => void }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-audit">AUDIT</span>
        <span className="logo-ai"> AI</span>
      </div>
      {onLogout && (
        <button className="btn-standalone-logout" onClick={onLogout}>LOGOUT</button>
      )}
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

export default function Dashboard({ onGenerateStart, onGenerateSuccess, onLogout }: { onGenerateStart: () => boolean, onGenerateSuccess: () => void, onLogout: () => void }) {
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

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.brandName.trim()) newErrors.brandName = "Brand name is required";
    if (!selectedUrl) newErrors.website = "Please select a website from suggestions";
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
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedUrl(brand.url);
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

  function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function cleanUrl(url: string): string {
    if (!url) return url;
    return url.replace(/\/view$/, "/preview");
  }

  async function performRequest() {
    const companyName = formData.brandName.trim();
    const url = normalizeUrl(selectedUrl);
    const industry = formData.industry.trim();
    const email = formData.email.trim();

    return fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        company_name: companyName,
        selected_url: url,
        industry: industry,
        recipient_email: email,
        email: email // Added as a fallback in case Make.com expects 'email'
      })
    });
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!onGenerateStart()) return;

    setScreen("loading");
    setWebhookError("");
    setIsSending(true);
    setActiveStep(0);
    setCompletedSteps([]);

    // Minimum time to show loading screen (Wait for Make.com to process asynchronously)
    const MIN_LOADING_MS = 90_000;
    const loadingStartTime = Date.now();

    let currentStep = 0;

    // Cycle through steps while loading screen is visible
    const progressInterval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      currentStep++;

      if (currentStep >= STEPS.length) {
        currentStep = 0;
        setCompletedSteps([]);
      }

      setActiveStep(currentStep);
    }, 3000);

    try {
      const res = await performRequest();

      console.log("=== WEBHOOK RESPONSE ===");
      console.log("HTTP Status:", res.status, res.statusText);

      if (!res.ok) throw new Error("Network response was not ok");

      const responseText = await res.text();
      console.log("Raw response text:", responseText);
      console.log("Response length:", responseText.length);

      // Wait for the remaining minimum loading time before proceeding
      const elapsed = Date.now() - loadingStartTime;
      const remaining = MIN_LOADING_MS - elapsed;
      if (remaining > 0) {
        console.log(`Webhook responded early. Waiting ${Math.round(remaining / 1000)}s more for Make.com to finish processing...`);
        await new Promise(r => setTimeout(r, remaining));
      }

      clearInterval(progressInterval);

      // Fast-forward any remaining steps sequentially
      for (let i = currentStep; i < STEPS.length; i++) {
        setActiveStep(i);
        await new Promise(r => setTimeout(r, 600));
        setCompletedSteps(prev => [...prev, i]);
      }

      await new Promise(r => setTimeout(r, 800));

      setScreen("success");
      onGenerateSuccess();

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
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedUrl("");
    setSearchError("");
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field !== "email") setSelectedBrand(null);
  }

  async function fetchSuggestions(value: string) {
    if (value.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setSearchError("");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsFetchingSuggestions(true);
    setSearchError("");

    try {
      const apiKey = import.meta.env.VITE_SERPER_API_KEY || "";
      if (!apiKey) console.warn("Missing VITE_SERPER_API_KEY");

      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          q: `${value} official website`
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const organic = data.organic || [];

      const unwantedDomains = [
        "wikipedia.org",
        "linkedin.com",
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "youtube.com",
        "bloomberg.com",
        "crunchbase.com"
      ];

      const urls: string[] = [];
      for (const item of organic) {
        if (!item.link) continue;
        try {
          const urlObj = new URL(item.link);
          const domain = urlObj.hostname.toLowerCase();
          const isUnwanted = unwantedDomains.some(unwanted => domain.includes(unwanted));
          if (!isUnwanted && !urls.includes(item.link)) {
            urls.push(item.link);
          }
        } catch { }
      }

      if (urls.length > 0) {
        setSuggestions(urls);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setSearchError("No results found");
        setShowDropdown(true);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Suggestion fetch failed:", error);
        setSuggestions([]);
        setSearchError("No results found");
        setShowDropdown(true);
      }
    } finally {
      setIsFetchingSuggestions(false);
    }
  }

  function handleInputChange(field: keyof FormData, value: string) {
    updateField(field, value);

    if (field === "brandName") {
      setSelectedUrl("");
      setFormData(prev => ({ ...prev, website: "" })); // Reset derived domain

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (value.trim().length >= 3) {
        debounceTimerRef.current = setTimeout(() => {
          fetchSuggestions(value.trim());
        }, 300);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
        setSearchError("");
      }
    }
  }

  function handleDropdownSelect(url: string) {
    const normalized = normalizeUrl(url);
    setFormData(prev => ({ ...prev, website: normalized }));
    setSelectedUrl(normalized);
    setShowDropdown(false);
    setSuggestions([]);
    setSearchError("");
    setErrors(prev => ({ ...prev, website: undefined }));
  }

  return (
    <>
      <Navbar onLogout={onLogout} />

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
                onChange={(e) => handleInputChange("brandName", e.target.value)}
                disabled={isSending}
                autoComplete="off"
              />
              {errors.brandName && <p className="form-error-text visible">{errors.brandName}</p>}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="website">WEBSITE URL</label>
              <input
                id="website"
                type="text"
                className={`form-input${errors.website ? " error" : ""}${highlightedFields.has("website") ? " filled-highlight" : ""}`}
                placeholder="Select from company suggestions..."
                value={formData.website}
                readOnly
                disabled={isSending}
              />
              {isFetchingSuggestions && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px' }}>Searching...</div>
              )}
              {showDropdown && (suggestions.length > 0 || searchError) && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  backgroundColor: '#0c1220',
                  border: '1px solid var(--gold, #C9A84C)',
                  borderRadius: '6px',
                  marginTop: '4px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  maxHeight: '260px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {searchError && suggestions.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '14px' }}>
                      {searchError}
                    </div>
                  ) : (
                    suggestions.map((url, idx) => {
                      const isSelected = selectedUrl === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleDropdownSelect(url)}
                          onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                          onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                            color: isSelected ? '#C9A84C' : '#fff',
                            border: 'none',
                            borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            transition: 'background 0.2s',
                            wordBreak: 'break-all',
                          }}
                        >
                          {url}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
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
            Analyzing website, social media & SEO data. This may take 60-120 seconds.
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
            Report sent to your email —{" "}
            <strong style={{ color: "var(--silver-light)" }}>{formData.email}</strong>. Check your inbox for the audit of{" "}
            <strong style={{ color: "var(--gold)" }}>{formData.brandName}</strong>.
          </p>

          <div className="success-buttons mt-8">
            <button className="btn-another" onClick={handleReset}>
              GENERATE ANOTHER REPORT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
