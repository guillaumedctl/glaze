/**
 * GLAZE UNIVERSAL SHIELD - Version 2.0
 * Enterprise AI Data Protection & Governance.
 * All logic and documentation in Universal English.
 */

// --- GLOBAL CONFIGURATION ---
const CONFIG = {
    PROXY_URL: 'https://proxy.glaze-api.workers.dev',
    POLLING_INTERVAL: 1000, // ms
    SUCCESS_TIMEOUT: 2000   // ms
};

const PLATFORMS = {
    "chatgpt.com":      { selector: "#prompt-textarea", mode: "innerText" },
    "claude.ai":        { selector: "[contenteditable='true']", mode: "innerText" },
    "gemini.google.com": { selector: ".ql-editor", mode: "innerText" },
    "perplexity.ai":    { selector: "textarea", mode: "value" }
};

const PII_PATTERNS = {
    email:   /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    api_key: /(sk-[a-zA-Z0-9]{48}|AKIA[0-9A-Z]{16})/,
    finance: /(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b|[A-Z]{2}\d{2}[A-Z0-9]{11,30})/,
    ssn:     /\b\d{3}-\d{2}-\d{4}\b/
};

// --- UTILITIES ---

/**
 * Detect current AI platform based on window location
 */
const getPlatformConfig = () => {
    const host = window.location.hostname;
    const entry = Object.entries(PLATFORMS).find(([domain]) => host.includes(domain));
    return entry ? entry[1] : null;
};

/**
 * Scan text for any defined sensitive patterns
 */
const checkSensitivity = (text) => {
    if (!text) return false;
    return Object.values(PII_PATTERNS).some(pattern => pattern.test(text));
};

/**
 * Professional Button Styling & States
 */
const setButtonState = (btn, state) => {
    const states = {
        safe: {
            bg: "#2563eb",
            border: "1px solid #3b82f6",
            text: "🛡️ GLAZE IT",
            opacity: "1"
        },
        warning: {
            bg: "#dc2626",
            border: "1px solid #f87171",
            text: "⚠️ SECURE PII",
            opacity: "1"
        },
        loading: {
            bg: "#475569",
            border: "1px solid #64748b",
            text: "🔒 SECURING...",
            opacity: "0.7"
        },
        success: {
            bg: "#16a34a",
            border: "1px solid #4ade80",
            text: "✅ SECURED",
            opacity: "1"
        },
        error: {
            bg: "#000000",
            border: "1px solid #334155",
            text: "❌ ERROR",
            opacity: "1"
        }
    };

    const s = states[state] || states.safe;
    btn.style.background = s.bg;
    btn.style.border = s.border;
    btn.style.opacity = s.opacity;
    btn.innerHTML = s.text;
};

// --- CORE ENGINE ---

const initializeShield = () => {
    const config = getPlatformConfig();
    if (!config) return;

    const inputField = document.querySelector(config.selector);

    // Prevent duplicate injection
    if (inputField && !document.getElementById('glaze-btn')) {
        const btn = document.createElement('button');
        btn.id = 'glaze-btn';
        
        // Base CSS styles
        btn.style.cssText = `
            color: white; 
            padding: 6px 14px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-weight: 700; 
            font-size: 11px; 
            margin: 8px; 
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
        `;
        
        setButtonState(btn, 'safe');

        // 1. REAL-TIME MONITORING
        const handleInput = () => {
            // The timeout ensures the DOM has updated with the pasted/typed text
            setTimeout(() => {
                const content = config.mode === "innerText" ? inputField.innerText : inputField.value;
                const isSensitive = checkSensitivity(content);
                setButtonState(btn, isSensitive ? 'warning' : 'safe');
            }, 0);
        };

        // Listen to multiple event types for maximum reliability
        inputField.addEventListener('input', handleInput);
        inputField.addEventListener('paste', handleInput); // Specifically handle paste
        inputField.addEventListener('keyup', handleInput); // Backup for some keyboard events

        // 2. PROTECTIVE ACTION
        btn.onclick = async (e) => {
            e.preventDefault();
            const originalText = config.mode === "innerText" ? inputField.innerText : inputField.value;
            const host = window.location.hostname.replace('www.', '');
            
            if (!originalText.trim()) return;

            setButtonState(btn, 'loading');

            try {
                const response = await fetch(CONFIG.PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: originalText,
                        platform: host
                    })
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(`Proxy error ${response.status}: ${errorMsg}`);
                }

                const data = await response.json();

                /**
                 * UX DECISION: We replace user input with the SECURED_TEXT (Redacted).
                 * This allows the user to review the masked data before hitting 'Send' on the AI platform.
                 */
                const resultText = data.secured_text || data.ai_answer;

                if (config.mode === "innerText") {
                    inputField.innerText = resultText;
                } else {
                    inputField.value = resultText;
                }

                setButtonState(btn, 'success');
                
                // Return to appropriate state after timeout
                setTimeout(() => {
                    handleInput(); 
                }, CONFIG.SUCCESS_TIMEOUT);

            } catch (err) {
                setButtonState(btn, 'error');
                console.error("[Glaze Shield Diagnostic]", err);
            }
        };

        // DOM Placement
        inputField.after(btn);
    }
};

// Start the scanning engine
setInterval(initializeShield, CONFIG.POLLING_INTERVAL);