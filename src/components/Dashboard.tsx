import { useState, useEffect, useRef } from "react";

type Screen = "landing" | "loading" | "success";

const WEBHOOK_URL = "https://hook.eu1.make.com/ra9kiir9p2l9qklc27r1hzwcplqs18k7";

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
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  industry: string;
  email: string;
}

interface FormErrors {
  brandName?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  industry?: string;
  email?: string;
}

export default function Dashboard({ onGenerateStart, onGenerateSuccess, onLogout }: { onGenerateStart: () => boolean, onGenerateSuccess: () => void, onLogout: () => void }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [formData, setFormData] = useState<FormData>({
    brandName: "",
    website: "",
    linkedinUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
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

  const [linkedinSuggestions, setLinkedinSuggestions] = useState<{ name: string, url: string }[]>([]);
  const [showLinkedinDropdown, setShowLinkedinDropdown] = useState<boolean>(false);
  const [selectedLinkedinUrl, setSelectedLinkedinUrl] = useState<string>("");
  const [isFetchingLinkedinSuggestions, setIsFetchingLinkedinSuggestions] = useState<boolean>(false);
  const [linkedinSearchError, setLinkedinSearchError] = useState<string>("");
  const linkedinAbortControllerRef = useRef<AbortController | null>(null);

  const [instagramSuggestions, setInstagramSuggestions] = useState<{ name: string, url: string }[]>([]);
  const [showInstagramDropdown, setShowInstagramDropdown] = useState<boolean>(false);
  const [selectedInstagramUrl, setSelectedInstagramUrl] = useState<string>("");
  const [isFetchingInstagramSuggestions, setIsFetchingInstagramSuggestions] = useState<boolean>(false);
  const [instagramSearchError, setInstagramSearchError] = useState<string>("");
  const instagramAbortControllerRef = useRef<AbortController | null>(null);

  const [facebookSuggestions, setFacebookSuggestions] = useState<{ name: string, url: string }[]>([]);
  const [showFacebookDropdown, setShowFacebookDropdown] = useState<boolean>(false);
  const [selectedFacebookUrl, setSelectedFacebookUrl] = useState<string>("");
  const [isFetchingFacebookSuggestions, setIsFetchingFacebookSuggestions] = useState<boolean>(false);
  const [facebookSearchError, setFacebookSearchError] = useState<string>("");
  const facebookAbortControllerRef = useRef<AbortController | null>(null);

  const [youtubeSuggestions, setYoutubeSuggestions] = useState<{ name: string, url: string }[]>([]);
  const [showYoutubeDropdown, setShowYoutubeDropdown] = useState<boolean>(false);
  const [selectedYoutubeUrl, setSelectedYoutubeUrl] = useState<string>("");
  const [isFetchingYoutubeSuggestions, setIsFetchingYoutubeSuggestions] = useState<boolean>(false);
  const [youtubeSearchError, setYoutubeSearchError] = useState<string>("");
  const youtubeAbortControllerRef = useRef<AbortController | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const openDropdown = (type: 'website' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'none') => {
    setShowDropdown(type === 'website');
    setShowLinkedinDropdown(type === 'linkedin');
    setShowInstagramDropdown(type === 'instagram');
    setShowFacebookDropdown(type === 'facebook');
    setShowYoutubeDropdown(type === 'youtube');
  };

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.brandName.trim()) newErrors.brandName = "Brand name is required";
    const errMsg = "Please select and verify the correct profile";
    if (!selectedUrl) newErrors.website = errMsg;
    if (!selectedLinkedinUrl) newErrors.linkedinUrl = errMsg;
    if (!selectedInstagramUrl) newErrors.instagramUrl = errMsg;
    if (!selectedFacebookUrl) newErrors.facebookUrl = errMsg;
    if (!selectedYoutubeUrl) newErrors.youtubeUrl = errMsg;
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
      linkedinUrl: "", // Reset linkedin
      instagramUrl: "",
      facebookUrl: "",
      youtubeUrl: "",
      industry: brand.industry,
    }));
    setErrors((prev) => ({
      ...prev,
      brandName: undefined,
      website: undefined,
      linkedinUrl: undefined,
      instagramUrl: undefined,
      facebookUrl: undefined,
      youtubeUrl: undefined,
      industry: undefined,
    }));

    const fields = new Set(["brandName", "website", "industry"]);
    setHighlightedFields(fields);
    setTimeout(() => setHighlightedFields(new Set()), 1200);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);

    fetchLinkedinSuggestions(brand.name, brand.url);
    fetchInstagramSuggestions(brand.name, brand.url);
    fetchFacebookSuggestions(brand.name, brand.url);
    fetchYoutubeSuggestions(brand.name, brand.url);
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
        linkedin_url: selectedLinkedinUrl,
        instagram_url: selectedInstagramUrl,
        facebook_url: selectedFacebookUrl,
        youtube_url: selectedYoutubeUrl,
        industry: industry,
        recipient_email: email
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
    setFormData({ brandName: "", website: "", linkedinUrl: "", instagramUrl: "", facebookUrl: "", youtubeUrl: "", industry: "", email: "" });
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
    setLinkedinSuggestions([]);

    setSelectedLinkedinUrl("");
    setLinkedinSearchError("");
    setInstagramSuggestions([]);

    setSelectedInstagramUrl("");
    setInstagramSearchError("");
    setFacebookSuggestions([]);

    setSelectedFacebookUrl("");
    setFacebookSearchError("");
    setYoutubeSuggestions([]);

    setSelectedYoutubeUrl("");
    setYoutubeSearchError("");
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field !== "email") setSelectedBrand(null);
  }

  async function fetchSuggestions(value: string, autoOpen: boolean = true) {
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
        if (autoOpen) openDropdown('website');
      } else {
        setSuggestions([]);
        setSearchError("No results found");
        if (autoOpen) openDropdown('website');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Suggestion fetch failed:", error);
        setSuggestions([]);
        setSearchError("No results found");
        if (autoOpen) openDropdown('website');
      }
    } finally {
      setIsFetchingSuggestions(false);
    }
  }

  function handleInputChange(field: keyof FormData, value: string) {
    updateField(field, value);

    if (field === "brandName") {
      setSelectedUrl("");
      setFormData(prev => ({ ...prev, website: "", linkedinUrl: "", instagramUrl: "", facebookUrl: "", youtubeUrl: "" })); // Reset derived domain
      setSelectedLinkedinUrl("");
      setLinkedinSuggestions([]);

      setSelectedInstagramUrl("");
      setInstagramSuggestions([]);

      setSelectedFacebookUrl("");
      setFacebookSuggestions([]);

      setSelectedYoutubeUrl("");
      setYoutubeSuggestions([]);


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
    openDropdown('none');
    setSuggestions([]);
    setSearchError("");
    setErrors(prev => ({ ...prev, website: undefined }));

    const currentBrandName = formData.brandName || '';
    if (currentBrandName && normalized) {
      if (!selectedLinkedinUrl) fetchLinkedinSuggestions(currentBrandName, normalized, false);
      if (!selectedInstagramUrl) fetchInstagramSuggestions(currentBrandName, normalized, false);
      if (!selectedFacebookUrl) fetchFacebookSuggestions(currentBrandName, normalized, false);
      if (!selectedYoutubeUrl) fetchYoutubeSuggestions(currentBrandName, normalized, false);
    }
  }

  async function fetchLinkedinSuggestions(brandName: string, website: string, autoOpen: boolean = false) {
    if (!brandName || !website) return;

    if (linkedinAbortControllerRef.current) {
      linkedinAbortControllerRef.current.abort();
    }
    linkedinAbortControllerRef.current = new AbortController();

    setIsFetchingLinkedinSuggestions(true);
    setLinkedinSearchError("");
    setLinkedinSuggestions([]);

    setSelectedLinkedinUrl("");
    setFormData(prev => ({ ...prev, linkedinUrl: "" }));

    try {
      const apiKey = import.meta.env.VITE_SERPER_API_KEY || "";
      if (!apiKey) console.warn("Missing VITE_SERPER_API_KEY");

      let domain = "";
      try {
        domain = new URL(website).hostname.replace(/^www\./, '');
      } catch {
        domain = website;
      }

      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          q: `site:linkedin.com/company ${brandName} ${domain}`
        }),
        signal: linkedinAbortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const organic = data.organic || [];

      const results: { name: string, url: string }[] = [];
      const seenUrls = new Set<string>();

      for (const item of organic) {
        if (!item.link) continue;
        try {
          const urlObj = new URL(item.link);
          const domainName = urlObj.hostname.toLowerCase();
          const path = urlObj.pathname.toLowerCase();

          if (domainName.includes('linkedin.com') && path.startsWith('/company/')) {
            const cleanTargetUrl = `https://www.linkedin.com${path.replace(/\/$/, '')}`;

            if (!seenUrls.has(cleanTargetUrl)) {
              seenUrls.add(cleanTargetUrl);

              let cleanName = item.title.replace(/\s*[\|-]?\s*LinkedIn\s*$/i, '').trim();
              cleanName = cleanName.replace(/\s*[\|-]?\s*Overview\s*$/i, '').trim();

              results.push({ name: cleanName, url: cleanTargetUrl });

              if (results.length >= 5) break;
            }
          }
        } catch { }
      }

      if (results.length > 0) {
        setLinkedinSuggestions(results);
        if (autoOpen) openDropdown('linkedin');
      } else {
        setLinkedinSearchError("No Linkedin profile found");
        if (autoOpen) openDropdown('linkedin');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("LinkedIn suggestion fetch failed:", error);
        setLinkedinSearchError("No Linkedin profile found");
        if (autoOpen) openDropdown('linkedin');
      }
    } finally {
      setIsFetchingLinkedinSuggestions(false);
    }
  }


  async function fetchInstagramSuggestions(brandName: string, website: string, autoOpen: boolean = false) {
    if (!brandName || !website) return;

    if (instagramAbortControllerRef.current) {
      instagramAbortControllerRef.current.abort();
    }
    instagramAbortControllerRef.current = new AbortController();

    setIsFetchingInstagramSuggestions(true);
    setInstagramSearchError("");
    setInstagramSuggestions([]);

    setSelectedInstagramUrl("");
    setFormData(prev => ({ ...prev, instagramUrl: "" }));

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
          q: `site:instagram.com  ${brandName}`
        }),
        signal: instagramAbortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const organic = data.organic || [];

      const results: { name: string, url: string }[] = [];
      const seenUrls = new Set<string>();

      for (const item of organic) {
        if (!item.link) continue;
        try {
          const urlObj = new URL(item.link);
          const domainName = urlObj.hostname.toLowerCase();
          const path = urlObj.pathname.toLowerCase();

          // Filtering rules
          if (domainName.includes('instagram')) {
            // Exclude posts/reels/videos
            if (path.includes('/p/') || path.includes('/reel/') || path.includes('/videos/') || path.includes('/shorts/') || path.includes('/watch')) continue;

            const cleanTargetUrl = item.link.split('?')[0].replace(/\/$/, '');

            if (!seenUrls.has(cleanTargetUrl)) {
              seenUrls.add(cleanTargetUrl);

              let cleanName = item.title;
              cleanName = cleanName.replace(/\s*[\|-]?\s*Instagram.*$/i, '').trim();

              results.push({ name: cleanName, url: cleanTargetUrl });

              if (results.length >= 5) break;
            }
          }
        } catch { }
      }

      if (results.length > 0) {
        setInstagramSuggestions(results);
        if (autoOpen) openDropdown('instagram');
      } else {
        setInstagramSearchError("No Instagram profile found");
        if (autoOpen) openDropdown('instagram');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Instagram suggestion fetch failed:", error);
        setInstagramSearchError("No Instagram profile found");
        if (autoOpen) openDropdown('instagram');
      }
    } finally {
      setIsFetchingInstagramSuggestions(false);
    }
  }

  async function fetchFacebookSuggestions(brandName: string, website: string, autoOpen: boolean = false) {
    if (!brandName || !website) return;

    if (facebookAbortControllerRef.current) {
      facebookAbortControllerRef.current.abort();
    }
    facebookAbortControllerRef.current = new AbortController();

    setIsFetchingFacebookSuggestions(true);
    setFacebookSearchError("");
    setFacebookSuggestions([]);

    setSelectedFacebookUrl("");
    setFormData(prev => ({ ...prev, facebookUrl: "" }));

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
          q: `site:facebook.com  ${brandName}`
        }),
        signal: facebookAbortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const organic = data.organic || [];

      const results: { name: string, url: string }[] = [];
      const seenUrls = new Set<string>();

      for (const item of organic) {
        if (!item.link) continue;
        try {
          const urlObj = new URL(item.link);
          const domainName = urlObj.hostname.toLowerCase();
          const path = urlObj.pathname.toLowerCase();

          // Filtering rules
          if (domainName.includes('facebook')) {
            // Exclude posts/reels/videos
            if (path.includes('/p/') || path.includes('/reel/') || path.includes('/videos/') || path.includes('/shorts/') || path.includes('/watch')) continue;

            const cleanTargetUrl = item.link.split('?')[0].replace(/\/$/, '');

            if (!seenUrls.has(cleanTargetUrl)) {
              seenUrls.add(cleanTargetUrl);

              let cleanName = item.title;
              cleanName = cleanName.replace(/\s*[\|-]?\s*Facebook.*$/i, '').trim();

              results.push({ name: cleanName, url: cleanTargetUrl });

              if (results.length >= 5) break;
            }
          }
        } catch { }
      }

      if (results.length > 0) {
        setFacebookSuggestions(results);
        if (autoOpen) openDropdown('facebook');
      } else {
        setFacebookSearchError("No Facebook profile found");
        if (autoOpen) openDropdown('facebook');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Facebook suggestion fetch failed:", error);
        setFacebookSearchError("No Facebook profile found");
        if (autoOpen) openDropdown('facebook');
      }
    } finally {
      setIsFetchingFacebookSuggestions(false);
    }
  }

  async function fetchYoutubeSuggestions(brandName: string, website: string, autoOpen: boolean = false) {
    if (!brandName || !website) return;

    if (youtubeAbortControllerRef.current) {
      youtubeAbortControllerRef.current.abort();
    }
    youtubeAbortControllerRef.current = new AbortController();

    setIsFetchingYoutubeSuggestions(true);
    setYoutubeSearchError("");
    setYoutubeSuggestions([]);

    setSelectedYoutubeUrl("");
    setFormData(prev => ({ ...prev, youtubeUrl: "" }));

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
          q: `site:youtube.com channel OR @ ${brandName}`
        }),
        signal: youtubeAbortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const organic = data.organic || [];

      const results: { name: string, url: string }[] = [];
      const seenUrls = new Set<string>();

      for (const item of organic) {
        if (!item.link) continue;
        try {
          const urlObj = new URL(item.link);
          const domainName = urlObj.hostname.toLowerCase();
          const path = urlObj.pathname.toLowerCase();

          // Filtering rules
          if (domainName.includes('youtube')) {
            // Exclude posts/reels/videos
            if (path.includes('/p/') || path.includes('/reel/') || path.includes('/videos/') || path.includes('/shorts/') || path.includes('/watch')) continue;

            const cleanTargetUrl = item.link.split('?')[0].replace(/\/$/, '');

            if (!seenUrls.has(cleanTargetUrl)) {
              seenUrls.add(cleanTargetUrl);

              let cleanName = item.title;
              cleanName = cleanName.replace(/\s*[\|-]?\s*YouTube.*$/i, '').trim();

              results.push({ name: cleanName, url: cleanTargetUrl });

              if (results.length >= 5) break;
            }
          }
        } catch { }
      }

      if (results.length > 0) {
        setYoutubeSuggestions(results);
        if (autoOpen) openDropdown('youtube');
      } else {
        setYoutubeSearchError("No Youtube profile found");
        if (autoOpen) openDropdown('youtube');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Youtube suggestion fetch failed:", error);
        setYoutubeSearchError("No Youtube profile found");
        if (autoOpen) openDropdown('youtube');
      }
    } finally {
      setIsFetchingYoutubeSuggestions(false);
    }
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
              <label className="form-label" htmlFor="brandName">BRAND NAME <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="brandName"
                type="text"
                className={`form-input${errors.brandName ? " error" : ""}${highlightedFields.has("brandName") ? " filled-highlight" : ""}`}
                placeholder="e.g. Company"
                value={formData.brandName}
                onChange={(e) => handleInputChange("brandName", e.target.value)}
                disabled={isSending}
                autoComplete="off"
              />
              {errors.brandName && <p className="form-error-text visible">{errors.brandName}</p>}
            </div>

            <div className="form-group" style={{ position: 'relative', zIndex: showDropdown ? 60 : 1 }}>
              <label className="form-label" htmlFor="website">WEBSITE URL <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="website"
                type="text"
                className={`form-input cursor-pointer ${errors.website ? " error" : ""}${highlightedFields.has("website") ? " filled-highlight" : ""}`}
                placeholder="Select from company suggestions..."
                value={formData.website}
                readOnly
                disabled={isSending}
                onClick={() => {
                  if (!isSending && (suggestions.length > 0 || searchError)) openDropdown(showDropdown ? 'none' : 'website');
                }}
              />
              {isFetchingSuggestions && !selectedUrl && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', zIndex: 20 }}>Searching...</div>
              )}
              {!isFetchingSuggestions && selectedUrl && (
                <div style={{ position: 'absolute', right: '8px', top: '36px', display: 'flex', gap: '6px', zIndex: 20 }}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); window.open(selectedUrl, '_blank'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}>Verify</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedUrl(''); setFormData(prev => ({ ...prev, website: '' })); if (suggestions.length === 0 && formData.brandName) { fetchSuggestions(formData.brandName, true); } else { openDropdown('website'); } }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>✖ Change</button>
                </div>
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

            <div className="form-group" style={{ position: 'relative', zIndex: showLinkedinDropdown ? 50 : 1 }}>
              <label className="form-label" htmlFor="linkedinUrl">LINKEDIN URL <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="linkedinUrl"
                type="text"
                className={`form-input cursor-pointer ${errors.linkedinUrl ? " error" : ""}${highlightedFields.has("linkedinUrl") ? " filled-highlight" : ""}`}
                placeholder="Select LinkedIn profile from suggestions..."
                value={formData.linkedinUrl ? (linkedinSuggestions.find(s => s.url === formData.linkedinUrl)?.name || formData.linkedinUrl) : ""}
                readOnly
                disabled={isSending}
                onClick={() => {
                  if (!isSending && (linkedinSuggestions.length > 0 || linkedinSearchError)) {
                    openDropdown(showLinkedinDropdown ? 'none' : 'linkedin');
                  }
                }}
              />
              {isFetchingLinkedinSuggestions && !selectedLinkedinUrl && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', zIndex: 20 }}>Searching...</div>
              )}
              {!isFetchingLinkedinSuggestions && selectedLinkedinUrl && (
                <div style={{ position: 'absolute', right: '8px', top: '36px', display: 'flex', gap: '6px', zIndex: 20 }}>
                  {selectedLinkedinUrl !== 'Not Available' && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(selectedLinkedinUrl, '_blank'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}>Verify</button>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedLinkedinUrl(''); setFormData(prev => ({ ...prev, linkedinUrl: '' })); if (linkedinSuggestions.length === 0 && formData.brandName) { fetchLinkedinSuggestions(formData.brandName, normalizeUrl(formData.website), true); } else { openDropdown('linkedin'); } }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>✖ Change</button>
                </div>
              )}
              {showLinkedinDropdown && (linkedinSuggestions.length > 0 || linkedinSearchError) && (
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
                  {linkedinSearchError && linkedinSuggestions.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '14px' }}>
                      {linkedinSearchError}
                    </div>
                  ) : (
                    <>
                      {linkedinSuggestions.map((suggestion, idx) => {
                        const isSelected = selectedLinkedinUrl === suggestion.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, linkedinUrl: suggestion.url }));
                              setSelectedLinkedinUrl(suggestion.url);

                              setLinkedinSearchError("");
                              setErrors(prev => ({ ...prev, linkedinUrl: undefined }));
                              openDropdown('none');
                            }}
                            onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                            onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 16px',
                              background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                              border: 'none',
                              borderBottom: idx < linkedinSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s',
                            }}
                          >
                            <span style={{ color: isSelected ? '#C9A84C' : '#fff', fontWeight: 500, fontSize: '14px' }}>{suggestion.name}</span>
                            <span style={{ color: '#a1a1aa', fontSize: '12px', wordBreak: 'break-all' }}>{suggestion.url}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, linkedinUrl: 'Not Available' }));
                          setSelectedLinkedinUrl('Not Available');
                          setLinkedinSearchError("");
                          setErrors(prev => ({ ...prev, linkedinUrl: undefined }));
                          openDropdown('none');
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '14px' }}>None of these</span>
                      </button>
                    </>
                  )}
                </div>
              )}
              {errors.linkedinUrl && <p className="form-error-text visible">{errors.linkedinUrl}</p>}
            </div>

            <div className="form-group" style={{ position: 'relative', zIndex: showInstagramDropdown ? 40 : 1 }}>
              <label className="form-label" htmlFor="instagramUrl">INSTAGRAM PROFILE <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="instagramUrl"
                type="text"
                className={`form-input cursor-pointer ${errors.instagramUrl ? " error" : ""}${highlightedFields.has("instagramUrl") ? " filled-highlight" : ""}`}
                placeholder="Select Instagram profile from suggestions..."
                value={formData.instagramUrl ? (instagramSuggestions.find(s => s.url === formData.instagramUrl)?.name || formData.instagramUrl) : ""}
                readOnly
                disabled={isSending}
                onClick={() => {
                  if (!isSending && (instagramSuggestions.length > 0 || instagramSearchError)) {
                    openDropdown(showInstagramDropdown ? 'none' : 'instagram');
                  }
                }}
              />
              {isFetchingInstagramSuggestions && !selectedInstagramUrl && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', zIndex: 20 }}>Searching...</div>
              )}
              {!isFetchingInstagramSuggestions && selectedInstagramUrl && (
                <div style={{ position: 'absolute', right: '8px', top: '36px', display: 'flex', gap: '6px', zIndex: 20 }}>
                  {selectedInstagramUrl !== 'Not Available' && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(selectedInstagramUrl, '_blank'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}>Verify</button>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedInstagramUrl(''); setFormData(prev => ({ ...prev, instagramUrl: '' })); if (instagramSuggestions.length === 0 && formData.brandName) { fetchInstagramSuggestions(formData.brandName, normalizeUrl(formData.website), true); } else { openDropdown('instagram'); } }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>✖ Change</button>
                </div>
              )}
              {showInstagramDropdown && (instagramSuggestions.length > 0 || instagramSearchError) && (
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
                  {instagramSearchError && instagramSuggestions.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '14px' }}>
                      {instagramSearchError}
                    </div>
                  ) : (
                    <>
                      {instagramSuggestions.map((suggestion, idx) => {
                        const isSelected = selectedInstagramUrl === suggestion.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, instagramUrl: suggestion.url }));
                              setSelectedInstagramUrl(suggestion.url);

                              setInstagramSearchError("");
                              setErrors(prev => ({ ...prev, instagramUrl: undefined }));
                              openDropdown('none');
                            }}
                            onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                            onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 16px',
                              background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                              border: 'none',
                              borderBottom: idx < instagramSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s',
                            }}
                          >
                            <span style={{ color: isSelected ? '#C9A84C' : '#fff', fontWeight: 500, fontSize: '14px' }}>{suggestion.name}</span>
                            <span style={{ color: '#a1a1aa', fontSize: '12px', wordBreak: 'break-all' }}>{suggestion.url}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, instagramUrl: 'Not Available' }));
                          setSelectedInstagramUrl('Not Available');
                          setInstagramSearchError("");
                          setErrors(prev => ({ ...prev, instagramUrl: undefined }));
                          openDropdown('none');
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '14px' }}>None of these</span>
                      </button>
                    </>
                  )}
                </div>
              )}
              {errors.instagramUrl && <p className="form-error-text visible">{errors.instagramUrl}</p>}
            </div>


            <div className="form-group" style={{ position: 'relative', zIndex: showFacebookDropdown ? 30 : 1 }}>
              <label className="form-label" htmlFor="facebookUrl">FACEBOOK PAGE <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="facebookUrl"
                type="text"
                className={`form-input cursor-pointer ${errors.facebookUrl ? " error" : ""}${highlightedFields.has("facebookUrl") ? " filled-highlight" : ""}`}
                placeholder="Select Facebook profile from suggestions..."
                value={formData.facebookUrl ? (facebookSuggestions.find(s => s.url === formData.facebookUrl)?.name || formData.facebookUrl) : ""}
                readOnly
                disabled={isSending}
                onClick={() => {
                  if (!isSending && (facebookSuggestions.length > 0 || facebookSearchError)) {
                    openDropdown(showFacebookDropdown ? 'none' : 'facebook');
                  }
                }}
              />
              {isFetchingFacebookSuggestions && !selectedFacebookUrl && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', zIndex: 20 }}>Searching...</div>
              )}
              {!isFetchingFacebookSuggestions && selectedFacebookUrl && (
                <div style={{ position: 'absolute', right: '8px', top: '36px', display: 'flex', gap: '6px', zIndex: 20 }}>
                  {selectedFacebookUrl !== 'Not Available' && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(selectedFacebookUrl, '_blank'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}>Verify</button>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFacebookUrl(''); setFormData(prev => ({ ...prev, facebookUrl: '' })); if (facebookSuggestions.length === 0 && formData.brandName) { fetchFacebookSuggestions(formData.brandName, normalizeUrl(formData.website), true); } else { openDropdown('facebook'); } }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>✖ Change</button>
                </div>
              )}
              {showFacebookDropdown && (facebookSuggestions.length > 0 || facebookSearchError) && (
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
                  {facebookSearchError && facebookSuggestions.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '14px' }}>
                      {facebookSearchError}
                    </div>
                  ) : (
                    <>
                      {facebookSuggestions.map((suggestion, idx) => {
                        const isSelected = selectedFacebookUrl === suggestion.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, facebookUrl: suggestion.url }));
                              setSelectedFacebookUrl(suggestion.url);

                              setFacebookSearchError("");
                              setErrors(prev => ({ ...prev, facebookUrl: undefined }));
                              openDropdown('none');
                            }}
                            onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                            onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 16px',
                              background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                              border: 'none',
                              borderBottom: idx < facebookSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s',
                            }}
                          >
                            <span style={{ color: isSelected ? '#C9A84C' : '#fff', fontWeight: 500, fontSize: '14px' }}>{suggestion.name}</span>
                            <span style={{ color: '#a1a1aa', fontSize: '12px', wordBreak: 'break-all' }}>{suggestion.url}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, facebookUrl: 'Not Available' }));
                          setSelectedFacebookUrl('Not Available');
                          setFacebookSearchError("");
                          setErrors(prev => ({ ...prev, facebookUrl: undefined }));
                          openDropdown('none');
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '14px' }}>None of these</span>
                      </button>
                    </>
                  )}
                </div>
              )}
              {errors.facebookUrl && <p className="form-error-text visible">{errors.facebookUrl}</p>}
            </div>


            <div className="form-group" style={{ position: 'relative', zIndex: showYoutubeDropdown ? 20 : 1 }}>
              <label className="form-label" htmlFor="youtubeUrl">YOUTUBE CHANNEL <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="youtubeUrl"
                type="text"
                className={`form-input cursor-pointer ${errors.youtubeUrl ? " error" : ""}${highlightedFields.has("youtubeUrl") ? " filled-highlight" : ""}`}
                placeholder="Select YouTube profile from suggestions..."
                value={formData.youtubeUrl ? (youtubeSuggestions.find(s => s.url === formData.youtubeUrl)?.name || formData.youtubeUrl) : ""}
                readOnly
                disabled={isSending}
                onClick={() => {
                  if (!isSending && (youtubeSuggestions.length > 0 || youtubeSearchError)) {
                    openDropdown(showYoutubeDropdown ? 'none' : 'youtube');
                  }
                }}
              />
              {isFetchingYoutubeSuggestions && !selectedYoutubeUrl && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', zIndex: 20 }}>Searching...</div>
              )}
              {!isFetchingYoutubeSuggestions && selectedYoutubeUrl && (
                <div style={{ position: 'absolute', right: '8px', top: '36px', display: 'flex', gap: '6px', zIndex: 20 }}>
                  {selectedYoutubeUrl !== 'Not Available' && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); window.open(selectedYoutubeUrl, '_blank'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}>Verify</button>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedYoutubeUrl(''); setFormData(prev => ({ ...prev, youtubeUrl: '' })); if (youtubeSuggestions.length === 0 && formData.brandName) { fetchYoutubeSuggestions(formData.brandName, normalizeUrl(formData.website), true); } else { openDropdown('youtube'); } }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>✖ Change</button>
                </div>
              )}
              {showYoutubeDropdown && (youtubeSuggestions.length > 0 || youtubeSearchError) && (
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
                  {youtubeSearchError && youtubeSuggestions.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '14px' }}>
                      {youtubeSearchError}
                    </div>
                  ) : (
                    <>
                      {youtubeSuggestions.map((suggestion, idx) => {
                        const isSelected = selectedYoutubeUrl === suggestion.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, youtubeUrl: suggestion.url }));
                              setSelectedYoutubeUrl(suggestion.url);

                              setYoutubeSearchError("");
                              setErrors(prev => ({ ...prev, youtubeUrl: undefined }));
                              openDropdown('none');
                            }}
                            onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; }}
                            onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 16px',
                              background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                              border: 'none',
                              borderBottom: idx < youtubeSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s',
                            }}
                          >
                            <span style={{ color: isSelected ? '#C9A84C' : '#fff', fontWeight: 500, fontSize: '14px' }}>{suggestion.name}</span>
                            <span style={{ color: '#a1a1aa', fontSize: '12px', wordBreak: 'break-all' }}>{suggestion.url}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, youtubeUrl: 'Not Available' }));
                          setSelectedYoutubeUrl('Not Available');
                          setYoutubeSearchError("");
                          setErrors(prev => ({ ...prev, youtubeUrl: undefined }));
                          openDropdown('none');
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '14px' }}>None of these</span>
                      </button>
                    </>
                  )}
                </div>
              )}
              {errors.youtubeUrl && <p className="form-error-text visible">{errors.youtubeUrl}</p>}
            </div>


            <div className="form-group">
              <label className="form-label" htmlFor="industry">INDUSTRY <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="industry"
                type="text"
                className={`form-input${errors.industry ? " error" : ""}${highlightedFields.has("industry") ? " filled-highlight" : ""}`}
                placeholder="e.g. Sector"
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                disabled={isSending}
              />
              {errors.industry && <p className="form-error-text visible">{errors.industry}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">RECIPIENT EMAIL <span style={{ color: '#ef4444' }}>*</span></label>
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
              className={`btn-generate transition-opacity duration-300 ${isSending || !formData.brandName || !selectedUrl || !selectedLinkedinUrl || !selectedInstagramUrl || !selectedFacebookUrl || !selectedYoutubeUrl || !formData.industry || !formData.email ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={isSending || !formData.brandName || !selectedUrl || !selectedLinkedinUrl || !selectedInstagramUrl || !selectedFacebookUrl || !selectedYoutubeUrl || !formData.industry || !formData.email}
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

          <h2 className="success-heading">Report generated successfully!</h2>

          <p className="success-subtext">
            The report will be sent shortly to your email —{" "}
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
