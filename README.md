# CodeHumanizer - Universal AI Code Detector & Production Sanitizer

> **Detect AI code artifacts, eliminate telltale fingerprints, strip vertical formatting bloat, and produce 100% human-idiomatic, production-ready code for any stack.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM_API-76b900.svg)](https://build.nvidia.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_3.8_Flash-8e75ff.svg)](https://ai.google.dev)

---

## 🚀 Overview

When AI models (ChatGPT, Claude, Gemini, Copilot) write code, they leave behind obvious, unidiomatic signatures that compromise code reviews, introduce security blindspots, and degrade maintainability:
- **Excessive Vertical Sprawl:** Breaking 1 function call or object argument across 5–12 lines with only 1 word per line.
- **Robotic Comment Dividers:** Mechanical ASCII borders (`/* |-----------------------------------| */`).
- **Trivial "Step-by-Step" Comments:** Stating the obvious (`// Step 1: Read email`, `// Check if empty`, `// Return result`).
- **Production Hazards:** Raw `console.log` dumps, missing error boundaries, hardcoded secrets, and missing input sanitization.

**CodeHumanizer** automatically detects these patterns with **Zero-Configuration Auto-Detection** and refactors the code into clean, senior-engineer standard architecture suitable for direct integration into production codebases.

---

## ✨ Key Features

- **⚡ 100% Zero-Config Auto-Detection:**
  Paste any code snippet without selecting a language. The system analyzes the syntax and keywords to auto-detect whether it is:
  - **React 19 / Next.js** (App router, TypeScript, hooks, strict types)
  - **Node.js / Express / NestJS** (Clean async/await controllers, HTTP status codes)
  - **Python / FastAPI / Django** (Strict PEP 8, typed Pydantic models, docstrings)
  - **PHP / WordPress / Laravel** (Secure plugin OOP classes, nonces, capabilities)
  - **HTML5 & Vanilla JavaScript** (Valid semantic markup, clean DOM events)
  - **SQL / Database Queries** (Indexed query formats, readable joins)

- **🧠 Dual AI Engine Support (Google Gemini & NVIDIA NIM):**
  - **Google Gemini 3.8 Flash:** Ultra-fast, highly accurate code intelligence.
  - **NVIDIA NIM API:** Accelerated inferencing using top coding models:
    - `deepseek-ai/deepseek-r1` (Advanced reasoning & code synthesis)
    - `qwen/qwen2.5-coder-32b-instruct` (Specialized code refactoring)
    - `mistralai/mistral-large-2-instruct` (Enterprise reliability)
    - `nvidia/llama-3.1-nemotron-70b-instruct`

- **🛡️ Rule-Based Fast Clean (Instant):**
  A lightning-fast local engine that executes in milliseconds without API calls:
  - Collapses single-word parameter line breaks into idiomatic code.
  - Strips ASCII banner borders and redundant whitespace.
  - Removes beginner-level procedural step comments.

- **📊 Comprehensive AI Audit & Hinglish Breakdown:**
  - AI Probability Score (0–100%).
  - Detected trigger list with line examples and solution explanations.
  - Hinglish & English deployment guide explaining how and where to drop the code in your main project.

- **📤 Direct GitHub Synchronization:**
  - Built-in GitHub deployment modal to push codebases directly to your repository with a single click.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express, tsx
- **AI Integrations:** `@google/genai` (Gemini SDK), NVIDIA NIM REST API (OpenAI-compatible)

---

## 📦 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/BanshwarTech/CodeHumanizer---AI-Code-Detector-Production-Sanitizer.git
cd CodeHumanizer---AI-Code-Detector-Production-Sanitizer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your API keys:
```env
# Required for default AI humanize & analysis
GEMINI_API_KEY="your_gemini_api_key_here"

# (Optional) NVIDIA NIM API key for DeepSeek R1 / Qwen models
NVIDIA_API_KEY="nvapi-your_nvidia_api_key_here"

PORT=3000
```

> **Tip:** You can obtain free NVIDIA NIM API keys with 1,000 free credits at [build.nvidia.com](https://build.nvidia.com).

### 4. Run the development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📖 How to Use

1. **Paste Code:** Copy your raw AI-generated code into the left editor or click **"Paste Clipboard"**.
2. **Auto-Detect:** The system automatically identifies the language and framework.
3. **Choose Clean Mode:**
   - **Fast Clean (Instant):** Instantly eliminates vertical line breaks and banner dividers locally.
   - **AI Auto-Humanize:** Performs a full senior-engineer refactor for complete production readiness.
4. **Inspect Audit:** Review the AI score, identified triggers, and Hinglish explanation.
5. **Copy Clean Code:** Use the **Copy** button to drop the pristine code into your project.

---

## 📂 Project Structure

```text
├── server.ts                    # Express backend with Gemini & NVIDIA NIM proxy routes
├── src/
│   ├── App.tsx                  # Main application orchestrator
│   ├── components/
│   │   ├── Header.tsx           # Navigation bar with NVIDIA & GitHub triggers
│   │   ├── Toolbar.tsx          # Controls, auto-detection badges, rule toggles
│   │   ├── CodeView.tsx         # Side-by-side Monaco-style code editors
│   │   ├── AnalysisBreakdown.tsx# AI fingerprint scoring, triggers & deployment guide
│   │   ├── NvidiaSettingsModal.tsx # NVIDIA NIM API key & model selector
│   │   └── GitHubPushModal.tsx  # GitHub token & push manager
│   ├── data/
│   │   └── sampleCodes.ts       # Presets for React, Node, Python, PHP, SQL, HTML
│   └── utils/
│       ├── detector.ts          # Automatic language & project classifier
│       └── sanitizer.ts         # Fast AST/regex clean and code analysis algorithms
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/BanshwarTech/CodeHumanizer---AI-Code-Detector-Production-Sanitizer/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
