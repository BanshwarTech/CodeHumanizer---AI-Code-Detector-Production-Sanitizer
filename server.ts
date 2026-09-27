import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory or env NVIDIA API key
let customNvidiaApiKey = process.env.NVIDIA_API_KEY || '';

// Active supported NVIDIA models
export const ACTIVE_NVIDIA_MODELS = [
  { id: 'deepseek-ai/deepseek-r1', name: 'NVIDIA DeepSeek R1 (Recommended Reasoning & Coding)' },
  { id: 'qwen/qwen2.5-coder-32b-instruct', name: 'NVIDIA Qwen 2.5 Coder 32B (Specialized Code Clean)' },
  { id: 'mistralai/mistral-large-2-instruct', name: 'NVIDIA Mistral Large 2 (Enterprise Grade)' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'NVIDIA Llama 3.1 Nemotron 70B' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'NVIDIA Meta Llama 3.1 70B' },
];

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Health check & Model Provider status endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasNvidiaKey: Boolean(customNvidiaApiKey || process.env.NVIDIA_API_KEY),
    activeProvider: customNvidiaApiKey ? 'nvidia' : 'gemini',
    availableNvidiaModels: ACTIVE_NVIDIA_MODELS,
    defaultNvidiaModel: 'deepseek-ai/deepseek-r1',
  });
});

/**
 * Push to GitHub via Personal Access Token
 */
app.post('/api/github/push', async (req, res) => {
  try {
    const { token, repoUrl } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'GitHub Personal Access Token is required' });
    }

    const cleanToken = token.trim();
    const targetRepo = repoUrl && repoUrl.trim()
      ? repoUrl.trim()
      : 'https://github.com/BanshwarTech/CodeHumanizer---AI-Code-Detector-Production-Sanitizer.git';

    // Parse repo URL to construct authenticated git URL
    // e.g. https://ghp_xxx@github.com/BanshwarTech/CodeHumanizer...
    const urlWithoutProtocol = targetRepo.replace(/^https?:\/\//, '');
    const authedUrl = `https://${cleanToken}@${urlWithoutProtocol}`;

    // Ensure git repository is initialized and commited
    await execAsync('git config user.name "alekhbanshwar" || true');
    await execAsync('git config user.email "alekhbanshwar2000@gmail.com" || true');
    await execAsync('git add .');
    await execAsync('git commit -m "Update CodeHumanizer: AI Code Detector & Production Sanitizer" || true');
    await execAsync('git branch -M main');

    // Push using the authenticated URL
    const { stdout, stderr } = await execAsync(`git push -u "${authedUrl}" main --force`);

    return res.json({
      success: true,
      message: 'Successfully pushed all code to GitHub repository!',
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error('Git push error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to push to GitHub',
    });
  }
});

/**
 * Endpoint to save / test custom NVIDIA API key directly from UI
 */
app.post('/api/config/nvidia', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      customNvidiaApiKey = '';
      return res.json({ success: true, message: 'NVIDIA API key cleared, reverted to Gemini' });
    }

    const trimmedKey = apiKey.trim();

    const testResp = await fetch('https://integrate.api.nvidia.com/v1/models', {
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
      },
    });

    if (testResp.status === 401 || testResp.status === 403) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NVIDIA API Key. Please check the key from build.nvidia.com.',
      });
    }

    customNvidiaApiKey = trimmedKey;
    return res.json({
      success: true,
      message: 'NVIDIA API Key successfully verified and connected!',
    });
  } catch (error: any) {
    console.error('Error verifying NVIDIA key:', error);
    if (req.body.apiKey && req.body.apiKey.startsWith('nvapi-')) {
      customNvidiaApiKey = req.body.apiKey.trim();
      return res.json({
        success: true,
        message: 'NVIDIA API Key saved.',
      });
    }
    return res.status(500).json({ error: error.message || 'Failed to verify NVIDIA key' });
  }
});

/**
 * Helper to call NVIDIA NIM OpenAI-compatible API
 */
async function callNvidiaAI(
  systemPrompt: string,
  userPrompt: string,
  modelName: string = 'deepseek-ai/deepseek-r1'
): Promise<string> {
  const apiKey = customNvidiaApiKey || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA API Key is missing');
  }

  const candidateModels = [
    modelName,
    'deepseek-ai/deepseek-r1',
    'qwen/qwen2.5-coder-32b-instruct',
    'mistralai/mistral-large-2-instruct',
    'nvidia/llama-3.1-nemotron-70b-instruct',
  ];

  const safeCandidates = Array.from(new Set(candidateModels)).filter(
    (m) => m !== 'meta/llama-3.3-70b-instruct'
  );

  let lastError: any = null;

  for (const candidate of safeCandidates) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: candidate,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 8192,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 410 || response.status === 404) {
        console.warn(`NVIDIA model ${candidate} returned status ${response.status}, trying fallback model...`);
        lastError = new Error(`Model ${candidate} is no longer available on NVIDIA NIM.`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      return content;
    } catch (err: any) {
      lastError = err;
      if (err.message && (err.message.includes('410') || err.message.includes('404') || err.message.includes('end of life'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All NVIDIA candidate models failed');
}

/**
 * Universal Code Analyzer for ANY project type & language
 */
app.post('/api/analyze-ai-code', async (req, res) => {
  try {
    const { code, language = 'javascript', projectType = 'any', provider = 'auto', nvidiaModel } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code content is required' });
    }

    const useNvidia =
      (provider === 'nvidia' || (provider === 'auto' && Boolean(customNvidiaApiKey || process.env.NVIDIA_API_KEY))) &&
      Boolean(customNvidiaApiKey || process.env.NVIDIA_API_KEY);

    const systemPrompt = `You are a Principal Software Engineer and expert code auditor specializing in detecting AI-generated code patterns, unidiomatic formatting artifacts, and production hazards across ANY programming language and architecture.

Analyze the provided code and return a JSON object evaluating why this looks AI-generated and what needs to be fixed before deployment to any production codebase.

Focus on detecting these classic universal AI artifacts:
1. "Over-verticalization" / Sparse line breaks (AI breaking single function calls, variable assignments, object keys, or parameters across 4-12 lines with 1 word/token per line).
2. Robotic decorative ASCII/Docblock comment banners (e.g. /* |---------------- Header ----------------| */ or /* ==================== */).
3. "Stating the obvious" / Robotic step-by-step comments (e.g. "// Step 1: Read value", "// Check if empty", "// Return result").
4. AI conversational remnants, markdown backticks, or copy-paste artifacts.
5. Inefficient, unidiomatic structural anti-patterns (unhandled errors, raw console.log dumps, missing input sanitization, inline CSS dumps in HTML, lack of indexing in SQL, hardcoded secrets).
6. Production risks: crash hazards, unhandled promise rejections, memory bottlenecks, security holes.

You must respond ONLY with valid JSON with the following structure:
{
  "aiProbabilityScore": number (0-100),
  "verdictTitle": string,
  "summary": string,
  "hinglishSummary": string,
  "detectedTriggers": [
    {
      "category": string ("formatting" | "robotic_comments" | "unidiomatic_structure" | "security_risk" | "performance"),
      "title": string,
      "description": string,
      "severity": string ("high" | "medium" | "low"),
      "exampleSnippet": string
    }
  ],
  "productionReadiness": {
    "isReady": boolean,
    "blockerCount": number,
    "productionRisks": string[]
  },
  "recommendedFixes": string[]
}`;

    const userPrompt = `Language: ${language}\nProject Target: ${projectType}\n\nCode to analyze:\n\`\`\`${language}\n${code.slice(0, 45000)}\n\`\`\``;

    let text = '';
    let usedProvider = 'gemini';

    if (useNvidia) {
      try {
        usedProvider = 'nvidia';
        text = await callNvidiaAI(systemPrompt, userPrompt, nvidiaModel || 'deepseek-ai/deepseek-r1');
      } catch (nvidiaErr: any) {
        console.warn('NVIDIA call failed, falling back to Gemini:', nvidiaErr);
        usedProvider = 'gemini (fallback)';
      }
    }

    if (!text) {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'Neither Gemini nor NVIDIA API key is configured.',
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
      text = response.text || '{}';
      usedProvider = 'gemini';
    }

    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.json({ success: true, data: parsed, provider: usedProvider });
  } catch (error: any) {
    console.error('Error analyzing code:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze code',
    });
  }
});

/**
 * Universal Humanize & Production-Sanitizer for ANY project type
 */
app.post('/api/humanize-code', async (req, res) => {
  try {
    const {
      code,
      language = 'javascript',
      mode = 'senior_dev_clean',
      options = {},
      provider = 'auto',
      nvidiaModel,
    } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code content is required' });
    }

    const useNvidia =
      (provider === 'nvidia' || (provider === 'auto' && Boolean(customNvidiaApiKey || process.env.NVIDIA_API_KEY))) &&
      Boolean(customNvidiaApiKey || process.env.NVIDIA_API_KEY);

    const {
      removeRoboticBanners = true,
      condenseVerticalSprawl = true,
      cleanTrivialComments = true,
      hardenSecurity = true,
      removeInlineStyles = true,
    } = options;

    let targetInstruction = '';
    if (mode === 'react_next') {
      targetInstruction = `Optimize specifically for modern React 19 / Next.js (App Router / TypeScript).
- Follow clean React hooks best practices (clean memoization, typed props, strict interfaces).
- Eliminate all AI divider banners and 1-token vertical line breaks.
- Replace console.log with proper error boundaries or error callbacks.
- Ensure 100% production ready and human written.`;
    } else if (mode === 'node_express') {
      targetInstruction = `Optimize for production Node.js / Express or NestJS.
- Clean async/await error handling with proper HTTP status codes.
- Remove hardcoded fallbacks like 'default_secret'.
- Eliminate repetitive '// Step 1:' comments and vertical sprawl.
- Package into clean controller/service modules ready for any Node project.`;
    } else if (mode === 'python_backend') {
      targetInstruction = `Optimize for production Python (FastAPI, Django, Flask, or data pipelines) following strict PEP 8.
- Collapse excessive vertical parameter splits into standard PEP 8 format.
- Replace obvious redundant comments with clean Google or Sphinx style docstrings.
- Ensure strict typing (typing / Pydantic) and robust exception handling.`;
    } else if (mode === 'wordpress_plugin') {
      targetInstruction = `Convert the code into a professional, modern WordPress Plugin architecture.
- Package it inside a well-structured Class with proper namespace or unique prefix.
- Add standard WordPress plugin header comments so it can be uploaded as a plugin ZIP directly or pasted in wp-content/plugins.
- Fix all security issues: use wp_verify_nonce/check_admin_referer, sanitize text/URLs, check current_user_can('manage_options' or 'edit_posts').
- Move inline CSS out into a clean wp_enqueue_style or scoped <style> block.
- Add graceful fallbacks (e.g. check if ZipArchive exists before attempting XLSX read).`;
    } else if (mode === 'functions_php') {
      targetInstruction = `Optimize this code so it can be safely pasted directly into a WordPress theme's functions.php or child theme.
- Keep clean procedural or static class methods with a strict unique prefix to prevent collisions.
- Remove all bloated vertical spacing and robotic decorative dividers.
- Ensure all AJAX actions have nonces and capability checks.`;
    } else if (mode === 'minimalist_lean') {
      targetInstruction = `Create the most compact, clean, and efficient production version for ANY project.
- Zero decorative comments. Minimal, elegant syntax.
- Maximum performance, zero boilerplate, and pure human senior-developer style.`;
    } else {
      targetInstruction = `Refactor this code as a Senior Human Software Engineer for ANY modern production project.
- Preserve 100% of the logic, features, and functionality.
- Eliminate ALL AI smells: collapse the ridiculous sparse multi-line wrappers, eradicate ASCII art banners, remove repetitive comments that describe obvious statements.
- Format strictly with idiomatic standard conventions (Standard Prettier/ESLint for JS/TS, PEP 8 for Python, PSR-12 for PHP, standard gofmt for Go, etc.).
- Retain high-value architectural comments while eliminating robotic filler.`;
    }

    const systemPrompt = `You are a Principal Software Engineer and expert code refactorer.
Your task is to take AI-generated code that contains telltale AI artifacts (ridiculous vertical line sprawl, robotic comment banners, repetitive comments, procedural bloat, potential security gaps) and rewrite it into clean, idiomatic, human-written, 100% production-ready code that can be dropped into ANY project or site without breaking.

Target Architecture & Mode:
${targetInstruction}

Specific Rules:
- Strip robotic ASCII / decorative comment banners: ${removeRoboticBanners}
- Condense absurd vertical line sprawl (1 token per line): ${condenseVerticalSprawl}
- Strip trivial / stating-the-obvious comments ("Step 1: Read value", etc.): ${cleanTrivialComments}
- Hardening & Security improvements: ${hardenSecurity}
- Clean inline styles into proper CSS/classes: ${removeInlineStyles}

You must respond ONLY with valid JSON with the following structure:
{
  "cleanedCode": string (The complete, ready-to-run, pristine refactored code for the target language),
  "stats": {
    "originalLines": number,
    "cleanedLines": number,
    "linesReducedPercent": number
  },
  "changesMade": [
    string
  ],
  "securityAndPerformanceFixes": [
    string
  ],
  "installationGuide": {
    "targetLocation": string,
    "steps": [
      string
    ],
    "verificationCheck": string
  }
}`;

    const userPrompt = `Language: ${language}\nTarget Mode: ${mode}\n\nOriginal Code:\n\`\`\`${language}\n${code.slice(0, 45000)}\n\`\`\``;

    let text = '';
    let usedProvider = 'gemini';

    if (useNvidia) {
      try {
        usedProvider = 'nvidia';
        text = await callNvidiaAI(systemPrompt, userPrompt, nvidiaModel || 'deepseek-ai/deepseek-r1');
      } catch (nvidiaErr: any) {
        console.warn('NVIDIA call failed, falling back to Gemini:', nvidiaErr);
        usedProvider = 'gemini (fallback)';
      }
    }

    if (!text) {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'Neither Gemini nor NVIDIA API key is configured.',
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      text = response.text || '{}';
      usedProvider = 'gemini';
    }

    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.json({ success: true, data: parsed, provider: usedProvider });
  } catch (error: any) {
    console.error('Error humanizing code:', error);
    return res.status(500).json({
      error: error.message || 'Failed to humanize code',
    });
  }
});

// Setup Vite in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
