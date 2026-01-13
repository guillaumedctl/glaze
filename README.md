# 🛡️ Glaze: The Trust Layer for Enterprise AI

**Ship AI innovation. Eliminate Shadow AI. Secure your data.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Status](https://img.shields.io/badge/Status-Open--Core-green.svg)]()
[![Built for Builders](https://img.shields.io/badge/Built_for-Builders-orange.svg)]()

---

## 💡 Why Glaze?

Generative AI is a double-edged sword. While your teams gain 40% productivity using ChatGPT, Claude, or Perplexity, your organization is exposed to critical risks:
* **Data Leaks (PII):** Customer names, industrial secrets, or API keys are sent to LLMs daily.
* **Shadow AI:** Over 80% of AI usage in the workplace is unsupervised, creating a massive governance gap.
* **Compliance Risks:** Potential GDPR, SOC2, and HIPAA violations.

**Glaze is a high-performance, invisible governance layer that sits between your users and AI models.** It acts as a smart privacy filter that "glazes" sensitive data before it ever leaves your infrastructure.

---

## 🏗️ Architecture: How it works

Glaze is built as a **Smart Proxy** leveraging low-latency Edge Computing.

1.  **Interception:** Every AI request is routed through the Glaze Proxy.
2.  **The Scrubber:** Glaze identifies sensitive entities (PII, secrets, financials) in real-time and replaces them with anonymous tokens.
3.  **Secure Inference:** The "scrubbed" prompt is sent to the LLM (OpenAI, Anthropic, etc.).
4.  **Governance & Audit:** Events are logged in your compliance dashboard without ever storing the raw sensitive content.

---

## ✨ Key Features

### 🔒 Real-time PII Scrubbing
Instantly detect and anonymize 50+ types of sensitive entities:
* **Identity:** Names, emails, phone numbers, passport IDs.
* **Technical:** API keys, JWTs, IP addresses, database credentials.
* **Financial:** Credit card numbers (Luhn-validated), IBANs, financial reports.

### 📊 Governance Dashboard
Gain full visibility into your organization's AI adoption:
* Identify which departments are using which AI tools.
* Track how many data leaks were prevented.
* Optimize token costs across teams.

### ⚡ Zero-Lag Performance
Built on Cloudflare Workers, Glaze adds less than 20ms of latency. Your users won't even know it's there.

### 🛠️ Open-Core & Transparent
The core masking engine is 100% open-source. Total transparency for your internal security audits.

---

## 🚀 Quick Start (60 Seconds)

### 1. Deploy the Proxy (Cloudflare Worker)
```bash
git clone [https://github.com/your-username/glaze-core](https://github.com/your-username/glaze-core)
cd glaze-core/proxy
npm install
npm run deploy
```

### 2. Configure Your Policy
Define your security rules in glaze.config.json:

```json
{
  "masking": {
    "emails": "anonymize",
    "api_keys": "block",
    "credit_cards": "mask"
  }
}
```

## 🤝 Join the Movement
Security shouldn't be a bottleneck for innovation. Glaze is built by builders, for builders.

* Star the repo to support the vision.
* Open an Issue to suggest a new detection pattern.
* Contribute to the open-source core.

## 📄 License
Distributed under the Apache 2.0 License. See LICENSE for more information.

Built with ❤️ for a secure and sovereign AI future.
