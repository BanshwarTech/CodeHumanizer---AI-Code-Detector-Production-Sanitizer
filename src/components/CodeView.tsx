import React, { useState, useRef } from 'react';
import { Copy, Check, Download, FileCode, Maximize2, Minimize2 } from 'lucide-react';

interface CodeViewProps {
  title: string;
  code: string;
  language: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  badge?: string;
  badgeColor?: string;
  stats?: {
    lines: number;
    chars: number;
  };
}

export const CodeView: React.FC<CodeViewProps> = ({
  title,
  code,
  language,
  readOnly = false,
  onChange,
  badge,
  badgeColor = 'bg-slate-800 text-slate-300',
  stats,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code ? code.split(/\r?\n/) : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    let ext = 'txt';
    if (language === 'php') ext = 'php';
    else if (language === 'typescript' || language === 'ts') ext = 'ts';
    else if (language === 'javascript' || language === 'js') ext = 'js';
    else if (language === 'python' || language === 'py') ext = 'py';
    else if (language === 'html') ext = 'html';
    else if (language === 'css') ext = 'css';
    else if (language === 'sql') ext = 'sql';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanitized-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/80 backdrop-blur transition-all ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[620px]'
      }`}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            {title}
          </span>
          {badge && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{stats.lines} lines</span>
              <span>·</span>
              <span>{(stats.chars / 1024).toFixed(1)} KB</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Download file"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand full screen'}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor / Code Container */}
      <div className="relative flex-1 overflow-hidden font-mono text-xs">
        {readOnly ? (
          <div className="h-full overflow-auto flex">
            {/* Line numbers */}
            <div className="select-none py-3 pl-3 pr-3 text-right text-slate-600 bg-slate-950/40 border-r border-slate-900 min-w-[3.5rem] tabular-nums">
              {lines.map((_, i) => (
                <div key={i} className="leading-5">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code lines */}
            <pre className="flex-1 py-3 px-4 text-slate-300 overflow-x-auto leading-5 whitespace-pre">
              <code>{code || '// No output yet. Click "Sanitize" or "Humanize" to generate.'}</code>
            </pre>
          </div>
        ) : (
          <div className="h-full flex relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange && onChange(e.target.value)}
              placeholder="Paste your AI-generated code here..."
              className="w-full h-full p-4 bg-transparent text-slate-200 resize-none font-mono text-xs leading-5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
