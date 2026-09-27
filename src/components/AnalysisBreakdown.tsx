import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  FileCode2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { DetectedTrigger } from '../utils/sanitizer';

interface AnalysisBreakdownProps {
  score: number;
  hinglishSummary: string;
  summary: string;
  triggers: DetectedTrigger[];
  stats: {
    originalLines: number;
    cleanedLines: number;
    linesReduced?: number;
  };
  installationGuide?: {
    targetLocation: string;
    steps: string[];
    verificationCheck?: string;
  };
  language: string;
  projectType?: string;
}

export const AnalysisBreakdown: React.FC<AnalysisBreakdownProps> = ({
  score,
  hinglishSummary,
  summary,
  triggers,
  stats,
  installationGuide,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'triggers' | 'guide' | 'hinglish'>('triggers');
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(triggers[0]?.id || null);

  const getScoreColor = (val: number) => {
    if (val >= 75)
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        label: 'Heavy AI Fingerprints Detected',
      };
    if (val >= 40)
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        label: 'Moderate AI Artifacts',
      };
    return {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      label: 'Clean / Human-Idiomatic',
    };
  };

  const scoreInfo = getScoreColor(score);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur p-5 space-y-5">
      {/* Top Score Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div
            className={`relative flex items-center justify-center w-16 h-16 rounded-xl border ${scoreInfo.border} ${scoreInfo.bg}`}
          >
            <span className={`text-2xl font-bold font-mono ${scoreInfo.text}`}>
              {score}%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${scoreInfo.text}`}>
                {scoreInfo.label}
              </span>
              <span className="text-xs text-slate-500">· Universal AI Code Audit</span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-0.5">
              AI Code Fingerprints & Production Readiness
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{summary}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-lg self-start md:self-auto">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Original</span>
            <span className="text-slate-200 font-semibold">{stats.originalLines} lines</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Cleaned</span>
            <span className="text-emerald-400 font-semibold">
              {stats.cleanedLines || '—'} {stats.cleanedLines ? 'lines' : ''}
            </span>
          </div>
          {stats.linesReduced !== undefined && stats.linesReduced > 0 && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Saved</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.round((stats.linesReduced / stats.originalLines) * 100)}% bloat removed
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('triggers')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'triggers'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Detected AI Triggers ({triggers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hinglish')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'hinglish'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Hinglish Guide (Kaise Remove Hua?)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'guide'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Main Site Me Add Karne Ke Steps</span>
        </button>
      </div>

      {/* Tab 1: Triggers List */}
      {activeTab === 'triggers' && (
        <div className="space-y-3">
          {triggers.map((trigger) => {
            const isExpanded = expandedTrigger === trigger.id;
            return (
              <div
                key={trigger.id}
                className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedTrigger(isExpanded ? null : trigger.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        trigger.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : trigger.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {trigger.severity}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{trigger.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{trigger.englishDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {trigger.occurrences > 1 && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {trigger.occurrences} instances
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/30 space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">
                        Hindi/Hinglish Reason:
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{trigger.hinglishDesc}</p>
                    </div>

                    {trigger.sampleLine && (
                      <div>
                        <span className="text-slate-500 text-[11px] font-medium block">
                          Detected Pattern / Snippet:
                        </span>
                        <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-amber-300/90 font-mono overflow-x-auto">
                          {trigger.sampleLine}
                        </pre>
                      </div>
                    )}

                    <div>
                      <span className="text-emerald-400 text-[11px] font-medium block">
                        Clean Solution Applied:
                      </span>
                      <p className="text-slate-300 mt-0.5">{trigger.solution}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Hinglish Explanation */}
      {activeTab === 'hinglish' && (
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                AI se likhe code me kya chize hoti hain aur unhe kaise hataya jata hai?
              </h4>
              <p className="text-slate-300 mt-1 leading-relaxed">{hinglishSummary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <h5 className="font-semibold text-amber-400 mb-1">
                1. Single-Word Vertical Sprawl (एक-एक शब्द की लाइनें)
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ChatGPT, Claude ya Gemini code generate karte samay token-by-token likhte hain, jisse har argument aur variable 1 alag line par tut jata hai. Is tool ka sanitizer unhe normal human coding standards (PSR-12, Prettier, PEP 8) me wapas condense kar deta hai.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <h5 className="font-semibold text-amber-400 mb-1">
                2. Mechanical ASCII Divider Boxes
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                /* |-----------------------------------| */ jaise decorative dividers AI models ka signature hota hai. Senior developer code me clean concise comments rakhte hain. Is tool ne in sabhi borders ko clean kar diya.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <h5 className="font-semibold text-amber-400 mb-1">
                3. "Step 1: Read email", "Step 2: Check" Comments
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                AI har choti si baat ka step comment likh deta hai jo code ko bohot amateur dikhata hai. Sanitizer in repetitive comments ko clean kar deta hai aur sirf zaroori architectural comments chhodta hai.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <h5 className="font-semibold text-emerald-400 mb-1">
                4. Production Safety & Crash Prevention
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                AI code me aksar try/catch me raw console.log, missing validation, ya server dependency (jaise PHP ZipArchive ya hardcoded secret keys) chut jati hain. Deep Humanize in sabhi hazards ko fix karke 100% production ready banata hai.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Guide */}
      {activeTab === 'guide' && (
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-slate-100">Recommended Project Placement:</span>
            </div>
            <code className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-[11px]">
              {installationGuide?.targetLocation || 'src/ or project root folder'}
            </code>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200">
              Apni Main Site / Project Me Add Karne Ka Tarika:
            </h5>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
              {(
                installationGuide?.steps || [
                  'Cleaned Code ko "Copy" ya "Save" button se export karein.',
                  'Apne project ke corresponding module me paste karein (e.g. React hook hai to src/hooks me, Express controller hai to src/controllers me, HTML form hai to apni site ke page me).',
                  'Environment Variables check karein: Agar code me database connection, API keys ya JWT secrets hain to unhe .env file se connect karein.',
                  'Dependency check karein: Agar koi package use ho raha hai (jaise bcryptjs, jsonwebtoken, react, etc.) to project me npm install ya composer install ensure karein.',
                  'Code ab 100% standard human developer format me hai, isme koi AI signature nahi dikhega aur production me safely chalega.',
                ]
              ).map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {installationGuide?.verificationCheck && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-[11px] block font-medium">
                Verification Test (Check kaise karein ki sahi se work kar raha hai):
              </span>
              <p className="text-emerald-300 text-xs mt-0.5 font-mono bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                {installationGuide.verificationCheck}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
