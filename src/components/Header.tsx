import React, { useState } from 'react';
import { FlagStatus, RaceAlert, RaceAlertConfig, DriverTiming, VpnState } from '../types/f1';
import { Radio, RefreshCw, Volume2, Compass, History, Activity, Trophy, Tv, ChevronDown, Shield, ShieldCheck } from 'lucide-react';
import { RaceAlertSystem } from './RaceAlertSystem';

interface HeaderProps {
  activeTab: 'race-center' | 'tracker' | 'timing' | 'telemetry' | 'historical' | 'stream' | 'timing-portals' | 'openf1' | 'channel-4';
  setActiveTab: (tab: 'race-center' | 'tracker' | 'timing' | 'telemetry' | 'historical' | 'stream' | 'timing-portals' | 'openf1' | 'channel-4') => void;
  flagStatus: FlagStatus;
  isSimulating: boolean;
  setIsSimulating: (val: boolean | ((prev: boolean) => boolean)) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedSession: string;
  alerts: RaceAlert[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  alertConfig: RaceAlertConfig;
  onUpdateAlertConfig: (config: RaceAlertConfig) => void;
  drivers: DriverTiming[];
  onTriggerTestAlert: (type: RaceAlert['type']) => void;
  selectedStreamChannel: string;
  onSelectStreamChannel: (channel: 'channel-4-uk' | 'sky-sports-f1-uk') => void;
  timingSource: 'openf1' | 'pitwall' | 'formula-timer' | 'f1pedia';
  onSelectTimingSource: (source: 'openf1' | 'pitwall' | 'formula-timer' | 'f1pedia') => void;
  vpnState?: VpnState;
  onOpenVpnModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  flagStatus,
  isSimulating,
  setIsSimulating,
  onRefresh,
  isRefreshing,
  selectedSession,
  alerts,
  onDismissAlert,
  onClearAllAlerts,
  alertConfig,
  onUpdateAlertConfig,
  drivers,
  onTriggerTestAlert,
  selectedStreamChannel,
  onSelectStreamChannel,
  timingSource,
  onSelectTimingSource,
  vpnState,
  onOpenVpnModal,
}) => {
  const [showTimingMenu, setShowTimingMenu] = useState(false);

  const getFlagBadge = () => {
    switch (flagStatus) {
      case 'GREEN':
        return { text: 'TRACK CLEAR', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'YELLOW':
        return { text: 'YELLOW SECTOR 2', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' };
      case 'VSC':
        return { text: 'VSC DEPLOYED', bg: 'bg-amber-500/25 text-amber-200 border-amber-500/60 animate-pulse' };
      case 'SC':
        return { text: 'SAFETY CAR', bg: 'bg-amber-600/30 text-amber-100 border-amber-500' };
      case 'RED':
        return { text: 'RED FLAG', bg: 'bg-red-600/30 text-red-200 border-red-500 animate-pulse' };
      case 'CHEQUERED':
        return { text: 'FINISH', bg: 'bg-neutral-800 text-white border-neutral-600' };
      default:
        return { text: 'LIVE TRACK', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  const flagInfo = getFlagBadge();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d0f15]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#e10600] rounded-xs skew-x-[-12deg]" />
          <a
            href="#race-center"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('race-center');
            }}
            className="text-lg lg:text-xl font-black tracking-tight text-white uppercase font-f1 flex items-center gap-2 hover:text-white/90"
          >
            <span>Apex PitWall</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono font-medium tracking-normal lowercase">
              live telemetry
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('race-center')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'race-center'
                ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Race Center
          </button>

          {/* CHANNEL 4 UK F1 WEBSITE */}
          <button
            onClick={() => {
              onSelectStreamChannel('channel-4-uk');
              setActiveTab('channel-4');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'channel-4' || (activeTab === 'stream' && selectedStreamChannel === 'channel-4-uk')
                ? 'bg-[#00E5FF] text-black shadow-sm shadow-[#00E5FF]/40'
                : 'text-[#00E5FF] hover:bg-[#00E5FF]/10'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
            <span className="px-1 py-0.2 bg-[#00E5FF]/20 text-[#00E5FF] rounded text-[10px] font-black border border-[#00E5FF]/30 font-mono">
              C4
            </span>
            <span>Channel 4 UK F1</span>
          </button>

          {/* SKY SPORTS F1 STREAM */}
          <button
            onClick={() => {
              onSelectStreamChannel('sky-sports-f1-uk');
              setActiveTab('stream');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stream' && selectedStreamChannel === 'sky-sports-f1-uk'
                ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Sky Sports F1</span>
          </button>

          {/* 2D DRIVER TRACKER */}
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tracker'
                ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Driver Tracking (2D)</span>
          </button>

          {/* LIVE TIMING & TELEMETRY MENU (Apex Tower / Formula Timer / F1Pedia) */}
          <div className="relative">
            <button
              onClick={() => {
                if (activeTab !== 'timing' && activeTab !== 'timing-portals') {
                  setActiveTab('timing');
                } else {
                  setShowTimingMenu((prev) => !prev);
                }
              }}
              onMouseEnter={() => setShowTimingMenu(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'timing' || activeTab === 'timing-portals'
                  ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Timing</span>
              <ChevronDown className="w-3 h-3 text-neutral-300" />
            </button>

            {/* Dropdown Menu for Live Timing Options */}
            {showTimingMenu && (
              <div
                onMouseLeave={() => setShowTimingMenu(false)}
                className="absolute top-full left-0 mt-1 w-60 bg-[#131722] border border-cyan-500/30 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in"
              >
                {/* OPENF1 TIMING TOWER */}
                <button
                  onClick={() => {
                    onSelectTimingSource('openf1');
                    setActiveTab('timing');
                    setShowTimingMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    timingSource === 'openf1' && activeTab === 'timing'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-bold">OpenF1 Timing Tower</span>
                  </div>
                  <span className="text-[10px] px-1 rounded bg-cyan-500/25 text-cyan-400 font-mono font-bold">20Hz API</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTimingSource('pitwall');
                    setActiveTab('timing');
                    setShowTimingMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    timingSource === 'pitwall' && activeTab === 'timing'
                      ? 'bg-red-600/20 text-white font-bold'
                      : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e10600]" />
                    <span>Apex PitWall Tower</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Standard</span>
                </button>

                {/* FORMULA-TIMER.COM */}
                <button
                  onClick={() => {
                    onSelectTimingSource('formula-timer');
                    setActiveTab('timing-portals');
                    setShowTimingMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    timingSource === 'formula-timer' && activeTab === 'timing-portals'
                      ? 'bg-red-600/20 text-white font-bold'
                      : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span>formula-timer.com</span>
                  </div>
                  <span className="text-[10px] px-1 rounded bg-red-600/30 text-red-400 font-mono">Live</span>
                </button>

                {/* F1PEDIA.COM */}
                <button
                  onClick={() => {
                    onSelectTimingSource('f1pedia');
                    setActiveTab('timing-portals');
                    setShowTimingMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    timingSource === 'f1pedia' && activeTab === 'timing-portals'
                      ? 'bg-sky-600/20 text-white font-bold'
                      : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🏎️</span>
                    <span>f1pedia.com/en</span>
                  </div>
                  <span className="text-[10px] px-1 rounded bg-sky-600/30 text-sky-400 font-mono">Telemetry</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Telemetry Lab
          </button>

          {/* OPENF1 LIVE HUB */}
          <button
            onClick={() => setActiveTab('openf1')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'openf1'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
              API
            </span>
            <span>OpenF1 Live</span>
          </button>

          <button
            onClick={() => setActiveTab('historical')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'historical'
                ? 'bg-[#e10600] text-white shadow-sm shadow-[#e10600]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historical Data</span>
          </button>
        </nav>

        {/* Zone 3: Alert System & Live Status */}
        <div className="flex items-center gap-2">
          {/* VPN System Status Button */}
          {onOpenVpnModal && vpnState && (
            <button
              onClick={onOpenVpnModal}
              title={`Apex PitWall VPN: ${
                vpnState.isConnected
                  ? `Connected to ${vpnState.currentServer.name} (${vpnState.currentServer.pingMs}ms)`
                  : 'Disconnected - Click to Connect'
              }`}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                vpnState.isConnected && vpnState.currentServer.isUk
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25'
                  : vpnState.isConnected
                  ? 'bg-sky-500/15 border-sky-500/35 text-sky-400 hover:bg-sky-500/25'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {vpnState.isConnected ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">VPN:</span>
                  <span>{vpnState.currentServer.flag}</span>
                  <span className="hidden md:inline">{vpnState.currentServer.city}</span>
                  <span className="text-[10px] text-emerald-300 font-normal">
                    {vpnState.currentServer.pingMs}ms
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  <span>VPN OFF</span>
                </>
              )}
            </button>
          )}

          {/* Race Alert System Component */}
          <RaceAlertSystem
            alerts={alerts}
            onDismissAlert={onDismissAlert}
            onClearAllAlerts={onClearAllAlerts}
            config={alertConfig}
            onUpdateConfig={onUpdateAlertConfig}
            drivers={drivers}
            onTriggerTestAlert={onTriggerTestAlert}
          />

          {/* Track flag indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono-nums font-bold tracking-wider ${flagInfo.bg}`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{flagInfo.text}</span>
          </div>

          {/* Real-time Telemetry Animation Toggle */}
          <button
            onClick={() => setIsSimulating((prev) => !prev)}
            title={isSimulating ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream'}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors ${
              isSimulating
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {isSimulating ? 'LIVE GPS' : 'PAUSED'}
          </button>

          {/* Refresh Data button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh F1 Timing Data"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md transition-colors border border-white/5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#e10600]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet nav bar */}
      <div className="flex xl:hidden items-center gap-1 mt-2.5 pt-2 border-t border-white/5 overflow-x-auto text-[11px] scrollbar-thin">
        <button
          onClick={() => setActiveTab('race-center')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'race-center' ? 'bg-[#e10600] text-white' : 'text-neutral-400'
          }`}
        >
          Race Center
        </button>

        <button
          onClick={() => {
            onSelectStreamChannel('channel-4-uk');
            setActiveTab('channel-4');
          }}
          className={`px-2.5 py-1 rounded font-bold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'channel-4' || (activeTab === 'stream' && selectedStreamChannel === 'channel-4-uk')
              ? 'bg-[#00E5FF] text-black'
              : 'text-[#00E5FF]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
          Channel 4 UK
        </button>

        {onOpenVpnModal && vpnState && (
          <button
            onClick={onOpenVpnModal}
            className={`px-2.5 py-1 rounded font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              vpnState.isConnected && vpnState.currentServer.isUk
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : vpnState.isConnected
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-white/5 text-neutral-400 border border-white/10'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>VPN {vpnState.isConnected ? vpnState.currentServer.flag : 'OFF'}</span>
          </button>
        )}

        <button
          onClick={() => {
            onSelectStreamChannel('sky-sports-f1-uk');
            setActiveTab('stream');
          }}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'stream' && selectedStreamChannel === 'sky-sports-f1-uk'
              ? 'bg-[#e10600] text-white'
              : 'text-neutral-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Sky F1
        </button>

        {/* OpenF1 Timing Tower on Mobile */}
        <button
          onClick={() => {
            onSelectTimingSource('openf1');
            setActiveTab('timing');
          }}
          className={`px-2.5 py-1 rounded font-bold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'timing' && timingSource === 'openf1'
              ? 'bg-cyan-500 text-black shadow-xs'
              : 'text-cyan-400 bg-cyan-500/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          OpenF1 Timing
        </button>

        {/* Formula Timer on Mobile */}
        <button
          onClick={() => {
            onSelectTimingSource('formula-timer');
            setActiveTab('timing-portals');
          }}
          className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'timing-portals' && timingSource === 'formula-timer'
              ? 'bg-[#e10600] text-white'
              : 'text-neutral-400'
          }`}
        >
          <span>⏱️</span>
          Formula-Timer
        </button>

        {/* F1Pedia on Mobile */}
        <button
          onClick={() => {
            onSelectTimingSource('f1pedia');
            setActiveTab('timing-portals');
          }}
          className={`px-2.5 py-1 rounded font-semibold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'timing-portals' && timingSource === 'f1pedia'
              ? 'bg-sky-500 text-black'
              : 'text-neutral-400'
          }`}
        >
          <span>🏎️</span>
          F1Pedia
        </button>

        <button
          onClick={() => {
            onSelectTimingSource('pitwall');
            setActiveTab('timing');
          }}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'timing' ? 'bg-[#e10600] text-white' : 'text-neutral-400'
          }`}
        >
          Timing Tower
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'tracker' ? 'bg-[#e10600] text-white' : 'text-neutral-400'
          }`}
        >
          <Compass className="w-3 h-3" />
          Tracker
        </button>

        <button
          onClick={() => setActiveTab('openf1')}
          className={`px-2.5 py-1 rounded font-bold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'openf1' ? 'bg-red-600 text-white' : 'text-neutral-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          OpenF1
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'historical' ? 'bg-[#e10600] text-white' : 'text-neutral-400'
          }`}
        >
          <History className="w-3 h-3" />
          Historical
        </button>
      </div>
    </header>
  );
};
