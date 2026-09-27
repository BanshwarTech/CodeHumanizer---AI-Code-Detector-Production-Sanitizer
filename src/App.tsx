import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CodeView } from './components/CodeView';
import { AnalysisBreakdown } from './components/AnalysisBreakdown';
import { NvidiaSettingsModal } from './components/NvidiaSettingsModal';
import { GitHubPushModal } from './components/GitHubPushModal';
import { SAMPLE_CODES, CodeSample } from './data/sampleCodes';
import {
  analyzeCodeLocal,
  sanitizeCodeLocal,
  DEFAULT_OPTIONS,
  SanitizerOptions,
  AnalysisResult,
} from './utils/sanitizer';
import { autoDetectLanguageAndProject, DetectedEnvironment } from './utils/detector';
import { CheckCircle2, AlertCircle, Sparkles, Wand2, Cpu } from 'lucide-react';

export default function App() {
  const [selectedSample, setSelectedSample] = useState<CodeSample>(SAMPLE_CODES[0]);
  const [rawCode, setRawCode] = useState<string>(SAMPLE_CODES[0].code);
  const [cleanedCode, setCleanedCode] = useState<string>('');
  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(true);
  const [manualLanguage, setManualLanguage] = useState<string>('');
  const [manualMode, setManualMode] = useState<string>('auto');
  const [options, setOptions] = useState<SanitizerOptions>(DEFAULT_OPTIONS);
  const [viewMode, setViewMode] = useState<'split' | 'cleaned_only'>('split');
  const [isDeepLoading, setIsDeepLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // NVIDIA API & Model State
  const [isNvidiaModalOpen, setIsNvidiaModalOpen] = useState(false);
  const [hasNvidiaKey, setHasNvidiaKey] = useState(false);
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState('deepseek-ai/deepseek-r1');
  const [usedProvider, setUsedProvider] = useState<string>('gemini');

  // GitHub Push Modal State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const targetGitHubRepo = 'https://github.com/BanshwarTech/CodeHumanizer---AI-Code-Detector-Production-Sanitizer.git';

  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [installationGuide, setInstallationGuide] = useState<{
    targetLocation: string;
    steps: string[];
    verificationCheck?: string;
  } | null>(null);

  // Check health and NVIDIA connection on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasNvidiaKey) {
          setHasNvidiaKey(true);
        }
        if (data.defaultNvidiaModel) {
          setSelectedNvidiaModel(data.defaultNvidiaModel);
        }
      })
      .catch((err) => console.log('Health check failed', err));
  }, []);

  // 100% Automatic Detection directly from code contents!
  const detectedEnv: DetectedEnvironment = useMemo(() => {
    return autoDetectLanguageAndProject(rawCode);
  }, [rawCode]);

  // Effective language & mode (Auto-selected if not manually overridden)
  const activeLanguage = manualLanguage || detectedEnv.language;
  const activeMode = manualMode !== 'auto' ? manualMode : (
    detectedEnv.projectType === 'wordpress' ? 'wordpress_plugin' :
    detectedEnv.projectType === 'react' ? 'react_next' :
    detectedEnv.projectType === 'nodejs' ? 'node_express' :
    detectedEnv.projectType === 'python' ? 'python_backend' :
    'senior_dev_clean'
  );

  // Compute local analysis
  const localAnalysis = useMemo(() => {
    return analyzeCodeLocal(rawCode, activeLanguage);
  }, [rawCode, activeLanguage]);

  // Initial local sanitization on load
  useEffect(() => {
    const result = sanitizeCodeLocal(rawCode, options);
    setCleanedCode(result.cleanedCode);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Preset Selection
  const handleSelectSample = (sample: CodeSample) => {
    setSelectedSample(sample);
    setRawCode(sample.code);
    setManualLanguage('');
    setManualMode('auto');
    const result = sanitizeCodeLocal(sample.code, options);
    setCleanedCode(result.cleanedCode);
    setAiAnalysis(null);
    setInstallationGuide(null);
    showToast(`Loaded "${sample.name}" — Auto-detected ${sample.language.toUpperCase()}`);
  };

  // Handle Raw Code Change
  const handleCodeChange = (newCode: string) => {
    setRawCode(newCode);
    const result = sanitizeCodeLocal(newCode, options);
    setCleanedCode(result.cleanedCode);
    setAiAnalysis(null);
  };

  // Quick Paste from Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showToast('Clipboard is empty! Copy some code first.', 'error');
        return;
      }
      setRawCode(text);
      setManualLanguage('');
      setManualMode('auto');
      const result = sanitizeCodeLocal(text, options);
      setCleanedCode(result.cleanedCode);
      const autoDet = autoDetectLanguageAndProject(text);
      showToast(`Pasted! Auto-detected as ${autoDet.frameworkName}`);
    } catch (e) {
      showToast('Could not read clipboard. Please paste directly into the box.', 'error');
    }
  };

  const handleClearCode = () => {
    setRawCode('');
    setCleanedCode('');
    setAiAnalysis(null);
    setInstallationGuide(null);
  };

  // Instant Rule-based sanitization
  const handleInstantSanitize = () => {
    const result = sanitizeCodeLocal(rawCode, options);
    setCleanedCode(result.cleanedCode);
    showToast(
      `Fast Cleaned! (${detectedEnv.frameworkName} auto-detected) Reduced by ${result.linesReduced} lines`
    );
  };

  // Deep AI Humanize & Harden
  const handleDeepHumanize = async () => {
    setIsDeepLoading(true);
    try {
      const res = await fetch('/api/humanize-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: rawCode,
          language: activeLanguage,
          mode: activeMode,
          options,
          provider: hasNvidiaKey ? 'nvidia' : 'auto',
          nvidiaModel: selectedNvidiaModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server returned an error');
      }

      setCleanedCode(data.data.cleanedCode);
      if (data.provider) {
        setUsedProvider(data.provider);
      }
      if (data.data.installationGuide) {
        setInstallationGuide(data.data.installationGuide);
      }

      // Analyze endpoint
      const analyzeRes = await fetch('/api/analyze-ai-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: rawCode,
          language: activeLanguage,
          projectType: detectedEnv.projectType,
          provider: hasNvidiaKey ? 'nvidia' : 'auto',
          nvidiaModel: selectedNvidiaModel,
        }),
      });

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.success && analyzeData.data) {
          const d = analyzeData.data;
          setAiAnalysis({
            aiProbabilityScore: d.aiProbabilityScore,
            summary: d.summary,
            hinglishSummary: d.hinglishSummary,
            triggers: (d.detectedTriggers || []).map((t: any, idx: number) => ({
              id: `ai_${idx}`,
              category: t.category,
              title: t.title,
              hinglishDesc: t.description,
              englishDesc: t.description,
              severity: t.severity,
              occurrences: 1,
              sampleLine: t.exampleSnippet,
              solution: 'Refactored in cleaned output',
            })),
            stats: {
              originalLines: rawCode.split(/\r?\n/).length,
              cleanedLines: data.data.cleanedCode.split(/\r?\n/).length,
              emptyLinesCount: 0,
              bannerCommentsCount: 0,
              trivialCommentsCount: 0,
              sparseWrapsCount: 0,
            },
          });
        }
      }

      const modelDisplayName = selectedNvidiaModel.split('/')[1] || selectedNvidiaModel;
      const engineName = data.provider === 'nvidia' ? `NVIDIA NIM (${modelDisplayName})` : 'Gemini 3.8 Flash';
      showToast(`Refactored successfully via ${engineName}!`);
    } catch (err: any) {
      console.warn('AI Deep Humanize fallback:', err);
      const result = sanitizeCodeLocal(rawCode, options);
      setCleanedCode(result.cleanedCode);
      showToast(
        `Fast clean applied. (Notice: ${err.message || 'using local universal sanitizer'})`,
        'success'
      );
    } finally {
      setIsDeepLoading(false);
    }
  };

  const activeAnalysis = aiAnalysis || localAnalysis;
  const rawLines = rawCode.split(/\r?\n/).length;
  const cleanedLines = cleanedCode.split(/\r?\n/).length;
  const linesReduced = Math.max(0, rawLines - cleanedLines);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 shadow-2xl transition-all">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* GitHub Push Modal */}
      <GitHubPushModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        repoUrl={targetGitHubRepo}
      />

      {/* NVIDIA Settings Modal */}
      <NvidiaSettingsModal
        isOpen={isNvidiaModalOpen}
        onClose={() => setIsNvidiaModalOpen(false)}
        hasNvidiaKey={hasNvidiaKey}
        onKeySaved={(connected) => {
          setHasNvidiaKey(connected);
          showToast(connected ? 'NVIDIA API Key connected!' : 'Reverted to Gemini API');
        }}
        selectedModel={selectedNvidiaModel}
        onModelChange={setSelectedNvidiaModel}
      />

      {/* Top Header */}
      <Header
        hasNvidiaKey={hasNvidiaKey}
        onOpenNvidiaModal={() => setIsNvidiaModalOpen(true)}
        selectedNvidiaModel={selectedNvidiaModel}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Banner */}
        <div className="rounded-xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                100% Zero-Config Auto-Detect
              </span>
              <span className="text-xs text-slate-500">
                · {hasNvidiaKey ? `Powered by NVIDIA (${selectedNvidiaModel.split('/')[1] || selectedNvidiaModel})` : 'Powered by Google Gemini & NVIDIA NIM'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display flex items-center gap-2">
              <span>Direct Paste & Humanize</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono font-normal">
                {detectedEnv.frameworkName}
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Aap bina koi language select kiye code paste karein. AI auto-detect karega aur aap chahein to <strong className="text-emerald-300">NVIDIA API Key</strong> connect karke DeepSeek R1, Qwen 2.5 Coder ya Mistral se refactor karwa sakte hain.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handlePasteFromClipboard}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              <span>Paste Clipboard</span>
            </button>
            <button
              onClick={handleDeepHumanize}
              disabled={isDeepLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-900/30"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{hasNvidiaKey ? 'NVIDIA Humanize' : 'Auto-Humanize'}</span>
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <Toolbar
          detectedEnv={detectedEnv}
          isAutoDetect={isAutoDetect}
          onToggleAutoDetect={setIsAutoDetect}
          selectedSampleId={selectedSample.id}
          onSelectSample={handleSelectSample}
          language={activeLanguage}
          onLanguageChange={setManualLanguage}
          selectedMode={manualMode}
          onModeChange={setManualMode}
          onInstantSanitize={handleInstantSanitize}
          onDeepHumanize={handleDeepHumanize}
          onClearCode={handleClearCode}
          onPasteFromClipboard={handlePasteFromClipboard}
          isDeepLoading={isDeepLoading}
          options={options}
          onOptionsChange={setOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Code Editors / Viewers */}
        <div className={`grid gap-5 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Left: Original AI-Generated Code */}
          {viewMode === 'split' && (
            <CodeView
              title={`Original Code (${detectedEnv.frameworkName})`}
              code={rawCode}
              language={activeLanguage}
              readOnly={false}
              onChange={handleCodeChange}
              badge="Paste Any Code Here"
              badgeColor="bg-rose-500/20 text-rose-300 border border-rose-500/30"
              stats={{
                lines: rawLines,
                chars: rawCode.length,
              }}
            />
          )}

          {/* Right: Sanitized / Humanized Production Code */}
          <CodeView
            title={`Cleaned Production Code (${detectedEnv.frameworkName})`}
            code={cleanedCode}
            language={activeLanguage}
            readOnly={true}
            badge={isDeepLoading ? 'Refactoring...' : hasNvidiaKey ? `NVIDIA NIM (${selectedNvidiaModel.split('/')[1] || selectedNvidiaModel})` : '100% Ready to Deploy'}
            badgeColor="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            stats={{
              lines: cleanedLines,
              chars: cleanedCode.length,
            }}
          />
        </div>

        {/* Analysis & Instructions Breakdown */}
        <AnalysisBreakdown
          score={activeAnalysis.aiProbabilityScore}
          summary={activeAnalysis.summary}
          hinglishSummary={activeAnalysis.hinglishSummary}
          triggers={activeAnalysis.triggers}
          stats={{
            originalLines: rawLines,
            cleanedLines: cleanedLines,
            linesReduced,
          }}
          installationGuide={installationGuide || undefined}
          language={activeLanguage}
          projectType={detectedEnv.projectType}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            CodeHumanizer · Direct zero-config code sanitization for any language or architecture.
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className={hasNvidiaKey ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {hasNvidiaKey ? `NVIDIA NIM: Active (${selectedNvidiaModel})` : 'NVIDIA NIM: Ready to Connect'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
