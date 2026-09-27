import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  FolderCode,
  ShieldCheck,
  Cpu,
  Wand2,
  Trash2,
  ClipboardPaste,
} from 'lucide-react';
import { SAMPLE_CODES, CodeSample } from '../data/sampleCodes';
import { SanitizerOptions } from '../utils/sanitizer';
import { DetectedEnvironment } from '../utils/detector';

interface ToolbarProps {
  detectedEnv: DetectedEnvironment;
  isAutoDetect: boolean;
  onToggleAutoDetect: (auto: boolean) => void;
  selectedSampleId: string;
  onSelectSample: (sample: CodeSample) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  onInstantSanitize: () => void;
  onDeepHumanize: () => void;
  onClearCode: () => void;
  onPasteFromClipboard: () => void;
  isDeepLoading: boolean;
  options: SanitizerOptions;
  onOptionsChange: (options: SanitizerOptions) => void;
  viewMode: 'split' | 'cleaned_only';
  onViewModeChange: (mode: 'split' | 'cleaned_only') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  detectedEnv,
  isAutoDetect,
  onToggleAutoDetect,
  selectedSampleId,
  onSelectSample,
  language,
  onLanguageChange,
  selectedMode,
  onModeChange,
  onInstantSanitize,
  onDeepHumanize,
  onClearCode,
  onPasteFromClipboard,
  isDeepLoading,
  options,
  onOptionsChange,
  viewMode,
  onViewModeChange,
}) => {
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-4 space-y-3.5">
      {/* Top Bar: Auto-Detector Status Badge & Sample Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: 100% Auto-Detect Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs">
            <Wand2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">Auto-Detected:</span>
            <span className="font-semibold text-emerald-300 font-mono">
              {detectedEnv.frameworkName}
            </span>
            <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {detectedEnv.confidence}% Match
            </span>
          </div>

          {/* Quick Paste & Clear Buttons */}
          <button
            onClick={onPasteFromClipboard}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 transition-colors"
            title="Paste code directly from your clipboard (Direct Auto-Detect)"
          >
            <ClipboardPaste className="h-3.5 w-3.5 text-cyan-400" />
            <span>Paste Any Code</span>
          </button>

          <button
            onClick={onClearCode}
            className="flex items-center gap-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Preset Sample Picker */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 ml-1">
            <FolderCode className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedSampleId}
              onChange={(e) => {
                const sample = SAMPLE_CODES.find((s) => s.id === e.target.value);
                if (sample) onSelectSample(sample);
              }}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="" disabled>
                Test with Sample...
              </option>
              {SAMPLE_CODES.map((s) => (
                <option key={s.id} value={s.id}>
                  Sample: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side: View mode toggle & Settings */}
        <div className="flex items-center gap-2">
          {/* Manual override button (Optional) */}
          <button
            onClick={() => setShowManualOverride(!showManualOverride)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              showManualOverride
                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Mode {showManualOverride ? '▲' : '▼'}
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => onViewModeChange('cleaned_only')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'cleaned_only'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clean Only
            </button>
          </div>

          {/* Rules Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Rules</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showOptionsDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xl z-30 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-200 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span>Sanitization Engine Rules</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.condenseVerticalSprawl}
                    onChange={(e) =>
                      onOptionsChange({ ...options, condenseVerticalSprawl: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Condense sparse 1-word line breaks</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.removeRoboticBanners}
                    onChange={(e) =>
                      onOptionsChange({ ...options, removeRoboticBanners: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Strip robotic ASCII divider banners</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.cleanTrivialComments}
                    onChange={(e) =>
                      onOptionsChange({ ...options, cleanTrivialComments: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Remove "Step 1: Read..." & obvious comments</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.normalizeBlankLines}
                    onChange={(e) =>
                      onOptionsChange({ ...options, normalizeBlankLines: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Collapse redundant blank lines</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.hardenSecurity}
                    onChange={(e) =>
                      onOptionsChange({ ...options, hardenSecurity: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Harden production security & error handling</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.removeInlineStyles}
                    onChange={(e) =>
                      onOptionsChange({ ...options, removeInlineStyles: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span>Clean inline styles into clean markup/classes</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Manual Override Section (Only if user wants to force a specific style) */}
      {showManualOverride && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-xs">
          <span className="text-slate-400 font-medium">Manual Override:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-200"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="go">Go</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Style:</span>
            <select
              value={selectedMode}
              onChange={(e) => onModeChange(e.target.value)}
              className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-200"
            >
              <option value="auto">Auto (Smart Architecture)</option>
              <option value="senior_dev_clean">Senior Human Dev (Universal Clean)</option>
              <option value="react_next">React / Next.js Production</option>
              <option value="node_express">Node.js / Express Clean Controller</option>
              <option value="python_backend">Python PEP 8 Production</option>
              <option value="wordpress_plugin">WordPress Plugin OOP</option>
              <option value="functions_php">WordPress functions.php</option>
              <option value="minimalist_lean">Minimalist Lean (Zero Fluff)</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>
            Bina kuch define kiye code paste karein — Language aur framework khud detect hoke clean
            hoga!
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Instant Rule Sanitizer */}
          <button
            onClick={onInstantSanitize}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
            title="Instant local clean (strips banners and collapses line breaks)"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fast Clean (Instant)</span>
          </button>

          {/* Deep AI Humanize */}
          <button
            onClick={onDeepHumanize}
            disabled={isDeepLoading}
            className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-cyan-500 transition-all ${
              isDeepLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Auto-detects language and does full senior engineer rewrite"
          >
            {isDeepLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Auto-Refactoring...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>AI Auto-Humanize & Harden</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
