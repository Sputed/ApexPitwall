import React, { useState } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Maximize2,
  Tv,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Volume2,
  Radio,
  Shield,
  Power,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { DriverTiming, FlagStatus, VpnState } from '../types/f1';
import { Channel4WebsiteView } from './Channel4WebsiteView';

interface StreamPlayerProps {
  currentLeader?: DriverTiming;
  flagStatus: FlagStatus;
  currentLap: number;
  totalLaps: number;
  theaterMode?: boolean;
  onToggleTheater?: () => void;
  initialChannel?: 'channel-4-uk' | 'sky-sports-f1-uk' | 'clean-feed' | 'f1-tv';
  vpnState?: VpnState;
  onOpenVpnModal?: () => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  currentLeader,
  flagStatus,
  currentLap,
  totalLaps,
  theaterMode = false,
  onToggleTheater,
  initialChannel = 'channel-4-uk',
  vpnState,
  onOpenVpnModal,
}) => {
  const [selectedServer, setSelectedServer] = useState<'server1' | 'server2' | 'server3'>('server1');
  const [selectedChannel, setSelectedChannel] = useState<string>(initialChannel);
  const [c4ViewMode, setC4ViewMode] = useState<'website' | 'live' | 'openf1' | 'guide'>('website');
  const [openf1Driver, setOpenf1Driver] = useState<number>(4); // Norris #4
  const [openf1Speed, setOpenf1Speed] = useState<number>(328);
  const [openf1Throttle, setOpenf1Throttle] = useState<number>(100);
  const [openf1Brake, setOpenf1Brake] = useState<number>(0);
  const [openf1Gear, setOpenf1Gear] = useState<number>(8);
  const [openf1Rpm, setOpenf1Rpm] = useState<number>(11860);
  const [openf1Drs, setOpenf1Drs] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Pulse simulated OpenF1 telemetry when in openf1 mode
  React.useEffect(() => {
    const timer = setInterval(() => {
      setOpenf1Speed((prev) => {
        const next = Math.min(354, Math.max(120, prev + Math.round((Math.random() - 0.48) * 8)));
        setOpenf1Throttle(next > 280 ? 100 : Math.max(25, Math.round(next / 3.4)));
        setOpenf1Brake(next < 250 && Math.random() > 0.6 ? Math.round(Math.random() * 85) : 0);
        setOpenf1Gear(next > 310 ? 8 : next > 260 ? 7 : next > 210 ? 6 : 5);
        setOpenf1Rpm(Math.round(next > 300 ? 11600 + Math.random() * 320 : 9300 + (next % 50) * 45));
        setOpenf1Drs(next > 290);
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const CHANNEL_4_OFFICIAL_URL = 'https://www.channel4.com/programmes/formula-1';

  const streamChannels = [
    {
      id: 'channel-4-uk',
      name: 'Channel 4 [UK]',
      fullName: 'Channel 4 F1 [UK] - Official Broadcast & Terrestrial Feed',
      officialUrl: CHANNEL_4_OFFICIAL_URL,
      url: 'https://flive.dpdns.org/stream',
      server: 'server1',
      badgeColor: '#00E5FF',
      commentary: 'David Coulthard, Mark Webber & Steve Jones',
      description: 'Official Channel 4 UK Formula 1 coverage (Qualifying & Race highlights, live British GP)',
    },
    {
      id: 'sky-sports-f1-uk',
      name: 'Sky Sports F1 [UK]',
      fullName: 'Server 1: Sky Sports F1 [UK] (Live Mirror)',
      officialUrl: 'https://www.skysports.com/f1',
      url: 'https://flive.dpdns.org/stream',
      server: 'server1',
      badgeColor: '#e10600',
      commentary: 'Martin Brundle & David Croft',
      description: 'Official Sky Sports F1 UK coverage with Martin Brundle & David Croft commentary',
    },
    {
      id: 'clean-feed',
      name: '[Clean] Sky Sports F1 HD',
      fullName: 'Server 1: Sky Sports F1 HD (Clean Feed)',
      officialUrl: 'https://f1live.dpdns.org/stream',
      url: 'https://f1live.dpdns.org/stream',
      server: 'server1',
      badgeColor: '#38bdf8',
      commentary: 'Clean High-Bitrate Feed',
      description: 'Ultra-low latency European stream mirror for Grand Prix sessions',
    },
    {
      id: 'f1-tv',
      name: 'F1 TV Pro Pit Lane',
      fullName: 'Server 2: F1 TV Pro International Feed',
      officialUrl: 'https://f1tv.formula1.com',
      url: 'https://flive.dpdns.org/stream',
      server: 'server2',
      badgeColor: '#f59e0b',
      commentary: 'Alex Jacques & Jolyon Palmer',
      description: 'Official Formula 1 World Feed with Alex Jacques & Jolyon Palmer',
    },
  ];

  const currentChannelObj =
    streamChannels.find((c) => c.id === selectedChannel) || streamChannels[0];

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (selectedChannel === 'channel-4-uk') {
      window.open(CHANNEL_4_OFFICIAL_URL, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://flive.dpdns.org/stream', '_blank', 'noopener,noreferrer');
    }
  };

  const isUkVpn = vpnState?.isConnected && vpnState?.currentServer?.isUk;

  return (
    <div className="flex flex-col h-full bg-[#0d0f15] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Top Stream Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#131722] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-white font-f1 flex items-center gap-1.5">
              {currentChannelObj.id === 'channel-4-uk' && (
                <span className="px-1.5 py-0.2 bg-[#00E5FF] text-black font-black text-[10px] rounded">
                  C4
                </span>
              )}
              {currentChannelObj.name}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-mono-nums">
            <span>Server 1</span>
            <span>·</span>
            <span>1080p 60fps</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Synchronized Timing
            </span>
          </div>
        </div>

        {/* VPN Quick Access in Player Header */}
        <div className="flex items-center gap-2">
          {onOpenVpnModal && (
            <button
              onClick={onOpenVpnModal}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isUkVpn
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                  : vpnState?.isConnected
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              }`}
              title="Open VPN Tunnel Manager"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {isUkVpn
                  ? `🇬🇧 UK VPN (${vpnState?.currentServer.pingMs}ms)`
                  : vpnState?.isConnected
                  ? `${vpnState.currentServer.flag} ${vpnState.currentServer.city}`
                  : 'Connect UK VPN'}
              </span>
            </button>
          )}

          {/* Server & Channel Selection Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => {
                setSelectedServer('server1');
                if (
                  selectedChannel !== 'channel-4-uk' &&
                  selectedChannel !== 'sky-sports-f1-uk' &&
                  selectedChannel !== 'clean-feed'
                ) {
                  setSelectedChannel('channel-4-uk');
                }
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedServer === 'server1'
                  ? 'bg-[#e10600] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🏎️</span>
              <span>Server 1</span>
            </button>
            <button
              onClick={() => {
                setSelectedServer('server2');
                setSelectedChannel('f1-tv');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedServer === 'server2'
                  ? 'bg-[#e10600] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🏁</span>
              <span>Server 2</span>
            </button>
          </div>

          {/* Stream Utility Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleReload}
              title="Reload Video Stream"
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                title={theaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleOpenExternal}
              title={
                selectedChannel === 'channel-4-uk'
                  ? 'Open Channel 4 F1 Portal (channel4.com)'
                  : 'Open stream in pop-out'
              }
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/10 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pop-out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Channel Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#090b10] border-b border-white/5 text-xs gap-2">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-thin">
          <span className="text-neutral-500 font-medium whitespace-nowrap font-mono text-[11px]">
            CHANNELS:
          </span>

          {/* CHANNEL 4 [UK] */}
          <button
            onClick={() => setSelectedChannel('channel-4-uk')}
            className={`px-3 py-1 rounded font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'channel-4-uk'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-sm shadow-[#00E5FF]/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="font-f1">Channel 4 [UK]</span>
            <span className="text-[10px] px-1 rounded bg-[#00E5FF]/30 text-[#00E5FF] font-mono">
              Official C4
            </span>
          </button>

          {/* SKY SPORTS F1 [UK] */}
          <button
            onClick={() => setSelectedChannel('sky-sports-f1-uk')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'sky-sports-f1-uk'
                ? 'bg-blue-600/30 text-sky-300 border border-blue-500/50 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Sky Sports F1 [UK]</span>
          </button>

          {/* CLEAN FEED */}
          <button
            onClick={() => setSelectedChannel('clean-feed')}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedChannel === 'clean-feed'
                ? 'bg-blue-600/30 text-sky-300 border border-blue-500/40'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            [Clean] Sky Sports F1 HD
          </button>

          {/* F1 TV PRO */}
          <button
            onClick={() => setSelectedChannel('f1-tv')}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedChannel === 'f1-tv'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            F1 TV Pit Lane
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
          <span className="text-neutral-300 font-medium">
            Commentary: <strong className="text-white">{currentChannelObj.commentary}</strong>
          </span>
        </div>
      </div>

      {/* Channel 4 Feature Callout & In-Website Launcher Banner */}
      {selectedChannel === 'channel-4-uk' && (
        <div className="px-4 py-2.5 bg-[#00E5FF]/10 border-b border-[#00E5FF]/20 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-[#00E5FF] text-black font-black text-[11px] rounded font-mono shadow-sm shadow-[#00E5FF]/30">
              CHANNEL 4 LIVE IN WEBSITE
            </span>
            <span className="font-semibold text-white">
              Formula 1 Terrestrial UK Broadcast
            </span>
            <span className="text-neutral-400 hidden md:inline">
              · Steve Jones, David Coulthard &amp; Mark Webber
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SYNC
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher: Website Hub vs Live Feed vs OpenF1 Cockpit vs Official Guide */}
            <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-[#00E5FF]/30 text-[11px]">
              <button
                onClick={() => setC4ViewMode('website')}
                className={`px-3 py-1 rounded font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  c4ViewMode === 'website'
                    ? 'bg-[#00E5FF] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🌐</span>
                <span>C4 Website</span>
              </button>
              <button
                onClick={() => setC4ViewMode('live')}
                className={`px-3 py-1 rounded font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  c4ViewMode === 'live'
                    ? 'bg-[#00E5FF] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>▶</span>
                <span>Live Feed</span>
              </button>
              <button
                onClick={() => setC4ViewMode('openf1')}
                className={`px-3 py-1 rounded font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  c4ViewMode === 'openf1'
                    ? 'bg-[#00E5FF] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>⚡</span>
                <span>OpenF1 Cockpit</span>
              </button>
              <button
                onClick={() => setC4ViewMode('guide')}
                className={`px-3 py-1 rounded font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  c4ViewMode === 'guide'
                    ? 'bg-[#00E5FF] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>📺</span>
                <span>C4 Shows</span>
              </button>
            </div>

            <a
              href={CHANNEL_4_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white font-mono text-[11px] rounded transition-colors flex items-center gap-1 border border-white/10"
            >
              <span>channel4.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Video Viewport */}
      <div className="relative flex-1 min-h-[380px] lg:min-h-[480px] bg-black overflow-hidden flex items-center justify-center">
        {/* VIEW 0: OFFICIAL CHANNEL 4 UK F1 WEBSITE PORTAL (FULL INTERACTIVE EXPERIENCE) */}
        {selectedChannel === 'channel-4-uk' && c4ViewMode === 'website' ? (
          <div className="w-full h-full relative z-10 overflow-y-auto">
            <Channel4WebsiteView
              currentLeader={currentLeader}
              flagStatus={flagStatus}
              currentLap={currentLap}
              totalLaps={totalLaps}
              vpnState={vpnState}
              onOpenVpnModal={onOpenVpnModal}
              onSwitchToOpenF1={() => {
                setC4ViewMode('openf1');
              }}
              onSwitchToSkyF1={() => {
                setSelectedChannel('sky-sports-f1-uk');
              }}
            />
          </div>
        ) : selectedChannel === 'channel-4-uk' && c4ViewMode === 'guide' ? (
          <div className="w-full h-full flex flex-col bg-[#0b0e14] relative z-10 overflow-y-auto">
            {/* Channel 4 Header Strip */}
            <div className="px-5 py-3 bg-[#111622] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#00E5FF] flex items-center justify-center font-black text-black font-mono text-base shadow-md shadow-[#00E5FF]/30">
                  4
                </div>
                <div>
                  <div className="text-white font-black font-f1 text-sm tracking-wide flex items-center gap-2">
                    <span>Channel 4 Formula 1 UK Hub</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold">
                      Programmes &amp; Episodes
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    https://www.channel4.com/programmes/formula-1
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setC4ViewMode('live')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-mono flex items-center gap-1.5 transition-all shadow-md shadow-[#00E5FF]/20 cursor-pointer"
                >
                  <span>▶ Launch Live Player Now</span>
                </button>
              </div>
            </div>

            {/* Channel 4 Programmes & Episodes Grid */}
            <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/15 via-blue-900/20 to-black border border-[#00E5FF]/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white font-f1 uppercase tracking-wide">
                    Live Channel 4 Formula 1 Coverage
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                    Whisper Films production for Channel 4 featuring Steve Jones, David Coulthard, Mark Webber, and Lee McKenzie with full qualifying &amp; race highlights.
                  </p>
                </div>
                <button
                  onClick={() => setC4ViewMode('live')}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E5FF]/30 cursor-pointer"
                >
                  <span>▶ Launch in Website</span>
                </button>
              </div>

              {/* Episode list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-2">
                  <div className="w-full h-24 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[#00E5FF]">
                    <Tv className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="text-[10px] text-[#00E5FF] font-mono font-bold">LATEST EPISODE</div>
                  <h4 className="font-bold text-white text-sm">Azerbaijan GP: Qualifying Highlights</h4>
                  <p className="text-xs text-neutral-400">
                    Comprehensive qualifying action from the Baku City Circuit with analysis.
                  </p>
                  <button
                    onClick={() => setC4ViewMode('live')}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    Play in Website
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-2">
                  <div className="w-full h-24 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-amber-400">
                    <Tv className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono font-bold">RACE SHOWCASE</div>
                  <h4 className="font-bold text-white text-sm">Azerbaijan GP: Grand Prix Race Show</h4>
                  <p className="text-xs text-neutral-400">
                    2 hours 30 mins of full uninterrupted Baku street racing analysis &amp; podium reaction.
                  </p>
                  <button
                    onClick={() => setC4ViewMode('live')}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    Play in Website
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-2">
                  <div className="w-full h-24 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-emerald-400">
                    <Tv className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">PADDOCK SPECIAL</div>
                  <h4 className="font-bold text-white text-sm">Paddock Uncut with Coulthard &amp; Webber</h4>
                  <p className="text-xs text-neutral-400">
                    Exclusive driver interviews and behind-the-scenes engineering walk.
                  </p>
                  <button
                    onClick={() => setC4ViewMode('live')}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    Play in Website
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selectedChannel === 'channel-4-uk' && c4ViewMode === 'openf1' ? (
          /* VIEW 2: OPENF1 + CHANNEL 4 SPLIT COCKPIT VIEW */
          <div className="w-full h-full flex flex-col lg:flex-row relative z-10 bg-black">
            {/* Left side: Live Video Stream */}
            <div className="flex-1 relative min-h-[300px] lg:min-h-full">
              <iframe
                key={`c4-${iframeKey}`}
                src={currentChannelObj.url}
                title="Channel 4 F1 Live Feed"
                className="w-full h-full border-0 absolute inset-0 z-10"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                referrerPolicy="no-referrer"
              />
              {/* Channel 4 Watermark */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-[#00E5FF]/40 flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span>CHANNEL 4 LIVE</span>
              </div>
            </div>

            {/* Right side: OpenF1 Live Telemetry Cockpit */}
            <div className="w-full lg:w-80 bg-[#0c0f16] border-t lg:border-t-0 lg:border-l border-white/10 p-3.5 flex flex-col gap-3 font-mono text-xs z-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">OpenF1 Sync (20Hz)</span>
                </div>
                <span className="text-[10px] text-neutral-400">api.openf1.org</span>
              </div>

              {/* Driver select in OpenF1 Cockpit */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {[
                  { num: 4, code: 'NOR', col: '#FF8000' },
                  { num: 81, code: 'PIA', col: '#FF8000' },
                  { num: 16, code: 'LEC', col: '#E80020' },
                  { num: 1, code: 'VER', col: '#3671C6' },
                ].map((d) => (
                  <button
                    key={d.num}
                    onClick={() => setOpenf1Driver(d.num)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      openf1Driver === d.num
                        ? 'bg-[#00E5FF] text-black'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    #{d.num} {d.code}
                  </button>
                ))}
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-2 font-mono-nums">
                <div className="bg-[#131722] p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-neutral-400">SPEED</div>
                  <div className="text-xl font-black text-white">{openf1Speed} <span className="text-[10px] text-neutral-400 font-normal">km/h</span></div>
                </div>

                <div className="bg-[#131722] p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-neutral-400">GEAR / RPM</div>
                  <div className="text-xl font-black text-yellow-400">G{openf1Gear} <span className="text-xs text-neutral-400">{openf1Rpm}</span></div>
                </div>

                <div className="bg-[#131722] p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-neutral-400">THROTTLE</div>
                  <div className="text-lg font-black text-emerald-400">{openf1Throttle}%</div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-400 h-full" style={{ width: `${openf1Throttle}%` }} />
                  </div>
                </div>

                <div className="bg-[#131722] p-2 rounded-lg border border-white/5">
                  <div className="text-[10px] text-neutral-400">BRAKE / DRS</div>
                  <div className="text-lg font-black text-red-400">
                    {openf1Brake}% <span className="text-xs text-sky-400 ml-1">{openf1Drs ? 'DRS' : ''}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-red-500 h-full" style={{ width: `${openf1Brake}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-neutral-300">
                <div className="text-neutral-500 text-[10px] uppercase font-bold mb-0.5">COMMENTARY AUDIO</div>
                <div>David Coulthard &amp; Mark Webber live on Channel 4 UK.</div>
              </div>

              <button
                onClick={() => setC4ViewMode('live')}
                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Expand Video to Full View
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: ACTIVE LIVE STREAM PLAYER (DEFAULT FOR C4 AND SKY F1) */
          <>
            <iframe
              key={iframeKey}
              src={currentChannelObj.url}
              title={`F1 Live Stream - ${currentChannelObj.name}`}
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              referrerPolicy="no-referrer"
              loading="lazy"
            />

            {/* Ambient background placeholder during loading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-[#07080c]">
              <div className="w-12 h-12 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-semibold text-white">
                Launching {currentChannelObj.name} in Website...
              </p>
              <p className="text-xs text-neutral-400 max-w-md mt-1">
                {currentChannelObj.fullName}
              </p>
            </div>
          </>
        )}

        {/* Floating Mini Timing Bar for Seamless Race Watching */}
        {currentLeader && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-xs text-white shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#e10600] font-black font-f1 tracking-wider text-[11px]">
                LAP {currentLap}/{totalLaps}
              </span>
              <div className="flex items-center gap-1.5 font-semibold">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentLeader.teamColor }}
                />
                <span>P1 {currentLeader.driverName}</span>
                <span className="text-neutral-400 font-mono-nums font-normal">
                  ({currentLeader.bestLapTime})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-300 font-mono-nums text-[11px]">
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-neutral-500">SPEED:</span>
                <span className="text-white font-bold">{currentLeader.currentSpeed} km/h</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-neutral-500">GEAR:</span>
                <span className="text-yellow-400 font-bold">{currentLeader.currentGear}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">DRS:</span>
                <span
                  className={
                    currentLeader.drsActive ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                  }
                >
                  {currentLeader.drsActive ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper Bar / Fallback Guidance */}
      <div className="px-4 py-2.5 bg-[#10141f] border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-sky-400 font-semibold">Active Stream:</span>
          <span className="text-white font-mono font-bold">{currentChannelObj.name}</span>
          <span>·</span>
          <span className="text-neutral-400">{currentChannelObj.description}</span>
        </div>

        <div className="flex items-center gap-3">
          {selectedChannel === 'channel-4-uk' ? (
            <a
              href={CHANNEL_4_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00E5FF] hover:underline flex items-center gap-1 font-mono"
            >
              <span>channel4.com/programmes/formula-1</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={handleOpenExternal}
              className="text-neutral-400 hover:text-white transition-colors underline decoration-dotted flex items-center gap-1 cursor-pointer"
            >
              <span>Open in Pop-out Window</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
