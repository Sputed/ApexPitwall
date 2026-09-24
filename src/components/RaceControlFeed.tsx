import React from 'react';
import { RaceControlMessage } from '../types/f1';
import { Flag, Radio, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RaceControlFeedProps {
  messages: RaceControlMessage[];
}

export const RaceControlFeed: React.FC<RaceControlFeedProps> = ({ messages }) => {
  const getIcon = (category: RaceControlMessage['category']) => {
    switch (category) {
      case 'FLAG':
        return <Flag className="w-3.5 h-3.5 text-amber-400" />;
      case 'SAFETY_CAR':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      case 'DRS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'RADIO':
        return <Radio className="w-3.5 h-3.5 text-sky-400" />;
      case 'TRACK_LIMITS':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="flex flex-col bg-[#0d0f15] rounded-xl border border-white/10 p-3 lg:p-4 shadow-xl font-mono-nums">
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-3.5 bg-[#e10600] rounded-xs" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white font-f1">
            FIA Race Control &amp; Pit Wall Radio
          </h3>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">LIVE FEED</span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-48 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-[#131722] border border-white/5 text-xs text-neutral-300"
          >
            <div className="mt-0.5 shrink-0">{getIcon(msg.category)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-0.5">
                <span className="font-bold text-white">{msg.time}</span>
                <span>·</span>
                <span>LAP {msg.lap}</span>
                <span>·</span>
                <span className="uppercase text-neutral-400 font-semibold">{msg.category}</span>
              </div>
              <p className="text-neutral-200 text-[11px] leading-tight font-medium">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
