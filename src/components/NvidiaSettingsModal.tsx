import React, { useState } from 'react';
import { Cpu, Key, Check, AlertCircle, X, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface NvidiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNvidiaKey: boolean;
  onKeySaved: (status: boolean) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const NvidiaSettingsModal: React.FC<NvidiaModalProps> = ({
  isOpen,
  onClose,
  hasNvidiaKey,
  onKeySaved,
  selectedModel,
  onModelChange,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your NVIDIA API key.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/config/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify NVIDIA API key');
      }

      setSuccess('NVIDIA API Key successfully verified and connected!');
      onKeySaved(true);
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error connecting to NVIDIA API');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await fetch('/api/config/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '' }),
      });
      setApiKey('');
      onKeySaved(false);
      setSuccess('NVIDIA Key removed. Reverted to Google Gemini.');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>NVIDIA NIM API Setup</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  DeepSeek R1 / Qwen / Mistral
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connect your NVIDIA API Key to use NVIDIA accelerated models
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

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Select NVIDIA AI Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="deepseek-ai/deepseek-r1">NVIDIA DeepSeek R1 (Top Reasoning & Coding)</option>
            <option value="qwen/qwen2.5-coder-32b-instruct">NVIDIA Qwen 2.5 Coder 32B (Clean Production Code)</option>
            <option value="mistralai/mistral-large-2-instruct">NVIDIA Mistral Large 2 (Reliable & Fast)</option>
            <option value="nvidia/llama-3.1-nemotron-70b-instruct">NVIDIA Llama 3.1 Nemotron 70B</option>
            <option value="meta/llama-3.1-70b-instruct">NVIDIA Meta Llama 3.1 70B</option>
          </select>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              NVIDIA API Key:
            </label>
            <a
              href="https://build.nvidia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Get Free Key at build.nvidia.com</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Key className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasNvidiaKey ? '•••••••••••••••• (Key Active - Enter to replace)' : 'nvapi-...'}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            NVIDIA provides 1,000 free API credits when you register at build.nvidia.com. The key usually starts with <code className="text-slate-400 font-mono">nvapi-...</code>
          </p>
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

        {/* Current status info */}
        <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${hasNvidiaKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-slate-300 font-medium">
              {hasNvidiaKey ? 'NVIDIA API Connected' : 'Using Google Gemini (Default)'}
            </span>
          </div>
          {hasNvidiaKey && (
            <button
              onClick={handleClear}
              disabled={loading}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline"
            >
              Disconnect NVIDIA
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Key...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Save & Connect</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
