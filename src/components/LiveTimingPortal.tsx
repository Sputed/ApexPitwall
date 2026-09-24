import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Maximize2, ShieldCheck, Zap, Activity, Info, Globe } from 'lucide-react';
import { DriverTiming } from '../types/f1';

interface LiveTimingPortalProps {
  source: 'formula-timer' | 'f1pedia';
  onSelectSource: (source: 'openf1' | 'formula-timer' | 'f1pedia' | 'pitwall') => void;
  currentLeader?: DriverTiming;
  currentLap?: number;
  totalLaps?: number;
}

export const LiveTimingPortal: React.FC<LiveTimingPortalProps> = ({
  source,
  onSelectSource,
  currentLeader,
  currentLap = 18,
  totalLaps = 51,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);

  const sources = {
    'formula-timer': {
      name: 'Formula Timer',
      url: 'https://formula-timer.com',
      badge: 'Formula-Timer.com',
      badgeColor: '#e10600',
      description: 'Community-driven high precision Formula 1 live timing, micro-sectors & driver delta tracking',
      features: ['Live Sector Deltas (S1, S2, S3)', 'Tyre Degradation Curves', 'Gap to Leader & Intervals', 'Track Map GPS Position'],
    },
    f1pedia: {
      name: 'F1Pedia Live Timing',
      url: 'https://f1pedia.com/en/live-timing',
      badge: 'F1Pedia.com',
      badgeColor: '#38bdf8',
      description: 'Comprehensive F1 live timing, lap-by-lap telemetry, speed traps, and race strategy dashboard',
      features: ['Real-Time Lap Progression', 'Speed Trap Speeds (km/h)', 'Pit Stop Duration Log', 'Historical Head-to-Head'],
    },
  };

  const current = sources[source];

  const handleOpenExternal = () => {
    window.open(current.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col bg-[#0d0f15] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Top Source Switcher & Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#131722] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#e10600] rounded-xs skew-x-[-12deg]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-f1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              Live Timing &amp; Telemetry Sources
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry Feeds
            </span>
          </div>
        </div>

        {/* Source Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5 text-xs font-mono">
          <button
            onClick={() => onSelectSource('openf1')}
            className="px-2.5 py-1 rounded font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>OpenF1 Timing Tower</span>
          </button>
          <button
            onClick={() => onSelectSource('formula-timer')}
            className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              source === 'formula-timer'
                ? 'bg-[#e10600] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>⏱️</span>
            <span>Formula-Timer</span>
          </button>
          <button
            onClick={() => onSelectSource('f1pedia')}
            className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              source === 'f1pedia'
                ? 'bg-sky-500 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🏎️</span>
            <span>F1Pedia</span>
          </button>
        </div>

        {/* External Pop-out & Refresh Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload Timing Feed"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-white/10 hover:bg-white/15 rounded-md transition-colors border border-white/10 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Pop-out</span>
          </button>
        </div>
      </div>

      {/* Source Meta & Features Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#090b10] border-b border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono"
            style={{ backgroundColor: `${current.badgeColor}20`, color: current.badgeColor, border: `1px solid ${current.badgeColor}40` }}
          >
            {current.badge}
          </span>
          <span className="text-neutral-300 font-medium">{current.description}</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-neutral-400">
          {current.features.slice(0, 3).map((feat, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Embedded Web Viewport */}
      <div className="relative w-full h-[650px] bg-black overflow-hidden flex items-center justify-center">
        {/* Iframe Loading Attempt */}
        <iframe
          key={iframeKey}
          src={current.url}
          title={current.name}
          className="w-full h-full border-0 absolute inset-0 z-10 bg-[#090b10]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Ambient Loading & CSP Notice Overlay (shown if browser blocks third-party iframe frame) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-0 bg-[#07080c] space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <div>
            <h3 className="text-base font-bold text-white font-f1">
              Connecting to {current.name} ({current.url})
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1 mx-auto">
              Embedding live timing feeds from {current.url}. If your browser restricts cross-origin headers, click the button below to launch directly in a synchronized floating window.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenExternal}
              className="px-4 py-2 bg-[#e10600] hover:bg-[#c30500] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch {current.name} in Full Window</span>
            </button>
            <button
              onClick={() => onSelectSource('pitwall')}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Use Apex PitWall Live Tower
            </button>
          </div>
        </div>

        {/* Synchronized Live Timing HUD Overlay at Bottom */}
        {currentLeader && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs text-white shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-3 font-mono-nums">
              <span className="px-2.5 py-1 rounded bg-[#e10600] font-black font-f1 tracking-wider text-[11px]">
                LAP {currentLap}/{totalLaps}
              </span>
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentLeader.teamColor }} />
                <span>P1 {currentLeader.driverName}</span>
                <span className="text-neutral-400 font-normal">({currentLeader.bestLapTime})</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-300 font-mono-nums text-[11px]">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-neutral-500">SPEED:</span>
                <span className="text-white font-bold">{currentLeader.currentSpeed} km/h</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-neutral-500">FEED:</span>
                <span className="text-sky-400 font-bold">{current.name}</span>
              </div>
              <button
                onClick={handleOpenExternal}
                className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 underline decoration-dotted"
              >
                <span>Pop-out {current.badge}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Launch Cards at Footer */}
      <div className="p-4 bg-[#10141f] border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div
          onClick={() => onSelectSource('formula-timer')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            source === 'formula-timer'
              ? 'bg-[#181d2c] border-[#e10600]/50'
              : 'bg-black/30 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-white font-f1 text-sm flex items-center gap-2">
              <span>⏱️ Formula Timer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 font-mono">
                formula-timer.com
              </span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <p className="text-neutral-400 leading-relaxed">
            Live telemetry delta curves, micro-sector tracking (purple/green/yellow), and comprehensive driver intervals.
          </p>
        </div>

        <div
          onClick={() => onSelectSource('f1pedia')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            source === 'f1pedia'
              ? 'bg-[#181d2c] border-sky-500/50'
              : 'bg-black/30 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-white font-f1 text-sm flex items-center gap-2">
              <span>🏎️ F1Pedia Live Timing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-600/20 text-sky-400 font-mono">
                f1pedia.com/en/live-timing
              </span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <p className="text-neutral-400 leading-relaxed">
            Real-time timing screens, pit stop strategy monitor, speed trap leaderboards, and telemetry trace comparisons.
          </p>
        </div>
      </div>
    </div>
  );
};
