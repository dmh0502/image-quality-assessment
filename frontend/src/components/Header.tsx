import React from 'react';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import type { ServerStatus } from '../types';

interface HeaderProps {
  status: ServerStatus | null;
  serverOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, serverOnline }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI đánh giá chất lượng hình ảnh</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30">
                v2.0 Attention
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Đánh giá chất lượng ảnh & nhận diện 25 loại biến dạng (No-Reference Image Quality Assessment)
            </p>
          </div>
        </div>

        {/* Server & Model Stats */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-medium">
              {serverOnline ? 'Backend Sẵn Sàng' : 'Mất Kết Nối API'}
            </span>
          </div>

          {/* Model Architecture */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>EfficientNet-B0 + Spatial Attention</span>
          </div>

          {/* Hardware Device */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span className="uppercase">{status?.device || 'CPU'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
