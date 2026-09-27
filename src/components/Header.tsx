import React from 'react';
import { Terminal, Shield, Zap, Sparkles, Globe, Cpu } from 'lucide-react';

interface HeaderProps {
  hasNvidiaKey: boolean;
  onOpenNvidiaModal: () => void;
  selectedNvidiaModel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  hasNvidiaKey,
  onOpenNvidiaModal,
  selectedNvidiaModel,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 font-display tracking-tight">
                CodeHumanizer
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Universal Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Universal AI Code Fingerprint Detector & Production Sanitizer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-4 text-slate-400 mr-2">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Any Language & Project</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Auto-Detect</span>
            </div>
          </div>

          {/* NVIDIA API Key Setup Button */}
          <button
            onClick={onOpenNvidiaModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              hasNvidiaKey
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/40 hover:text-white'
            }`}
            title="Configure NVIDIA API Key (Llama 3.3, DeepSeek R1, Mistral)"
          >
            <div className={`w-2 h-2 rounded-full ${hasNvidiaKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>{hasNvidiaKey ? 'NVIDIA Connected' : 'NVIDIA API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
