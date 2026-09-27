import React, { useState } from 'react';
import { GitBranch, Key, Check, AlertCircle, X, ExternalLink, ArrowUpRight, Terminal, Copy } from 'lucide-react';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({
  isOpen,
  onClose,
  repoUrl,
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token.trim()) {
      setError('Please enter your GitHub Personal Access Token (PAT).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          repoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to push to GitHub');
      }

      setSuccess('Successfully pushed entire codebase to GitHub!');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Error pushing to GitHub repository');
    } finally {
      setLoading(false);
    }
  };

  const terminalCmd = `git remote add origin ${repoUrl}\ngit branch -M main\ngit push -u origin main`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(terminalCmd);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Push Code to GitHub</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                  main branch
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                Target: {repoUrl}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Method 1: Instant 1-Click Push with Token */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-200">
              GitHub Personal Access Token (Classic / Fine-grained):
            </label>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=CodeHumanizer-Push"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Create Token on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Key className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            GitHub requires a token with <code className="text-slate-300 font-mono">repo</code> permissions to authenticate push operations over HTTPS.
          </p>

          <button
            onClick={handlePush}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Pushing to {repoUrl.split('/').slice(-1)[0]}...</span>
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4" />
                <span>Authorize & Push to Repository</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Alternative: Local Terminal Command */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span>Or run in your local terminal:</span>
            </span>
            <button
              onClick={handleCopyCmd}
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
            >
              {copiedTerminal ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedTerminal ? 'Copied' : 'Copy Commands'}</span>
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
            {terminalCmd}
          </pre>
        </div>
      </div>
    </div>
  );
};
