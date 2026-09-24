import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Tv,
  ShieldCheck,
  Globe,
  Radio,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  Info,
  Share2,
  Download,
  Flame,
  Search,
  User,
  Film,
  Compass,
} from 'lucide-react';
import { DriverTiming, FlagStatus, VpnState } from '../types/f1';

interface Channel4WebsiteViewProps {
  currentLeader?: DriverTiming;
  flagStatus: FlagStatus;
  currentLap: number;
  totalLaps: number;
  vpnState?: VpnState;
  onOpenVpnModal?: () => void;
  onSwitchToOpenF1?: () => void;
  onSwitchToSkyF1?: () => void;
}

interface C4Episode {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  date: string;
  type: 'highlights' | 'live' | 'special' | 'tech';
  description: string;
  thumbnailUrl: string;
  streamUrl: string;
  presenters: string[];
}

const C4_EPISODES: C4Episode[] = [
  {
    id: 'c4-baku-race',
    title: 'Azerbaijan Grand Prix: Race Highlights',
    subtitle: 'Series 2024 · Episode 17 · 2h 15m',
    duration: '2h 15m',
    date: 'Broadcast on Channel 4 UK',
    type: 'highlights',
    description:
      'Steve Jones, David Coulthard, and Mark Webber present full comprehensive highlights from the Baku City Circuit. High drama on the shores of the Caspian Sea as McLaren and Ferrari battle to the chequered flag.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://flive.dpdns.org/stream',
    presenters: ['Steve Jones', 'David Coulthard', 'Mark Webber'],
  },
  {
    id: 'c4-baku-quali',
    title: 'Azerbaijan Grand Prix: Qualifying Highlights',
    subtitle: 'Series 2024 · Episode 16 · 1h 15m',
    duration: '1h 15m',
    date: 'Broadcast on Channel 4 UK',
    type: 'highlights',
    description:
      'The thrilling battle for pole position around the tight Castle section and the 2.2km high-speed straight in Baku with expert analysis from former Red Bull race winner Mark Webber.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541348263662-e0c86437da7b?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://flive.dpdns.org/stream',
    presenters: ['Steve Jones', 'David Coulthard', 'Mark Webber'],
  },
  {
    id: 'c4-silverstone-live',
    title: 'British Grand Prix: Live Race Day Full Coverage',
    subtitle: 'Series 2024 · Live Special · 3h 40m',
    duration: '3h 40m',
    date: 'Channel 4 Free-to-Air Live UK Flagship',
    type: 'live',
    description:
      'Channel 4’s exclusive terrestrial live coverage of the British Grand Prix from Silverstone. Complete uninterrupted pre-race build-up, grid walk with DC, full live Grand Prix race, and podium celebrations.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://flive.dpdns.org/stream',
    presenters: ['Steve Jones', 'David Coulthard', 'Mark Webber', 'Eddie Jordan', 'Lee McKenzie'],
  },
  {
    id: 'c4-paddock-uncut',
    title: 'Formula 1: The Paddock Uncut',
    subtitle: 'Series 2024 · Special Feature · 45m',
    duration: '45m',
    date: 'Exclusive Whisper Production for C4',
    type: 'special',
    description:
      'Unrestricted behind-the-scenes access to the driver paddock and team motorhomes. David Coulthard and Mark Webber speak directly to Lando Norris, Max Verstappen, and Lewis Hamilton.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://flive.dpdns.org/stream',
    presenters: ['David Coulthard', 'Mark Webber'],
  },
  {
    id: 'c4-tech-aerodynamics',
    title: 'Tech Talk: Ground Effect & Flexible Wings with DC',
    subtitle: 'Channel 4 Engineering Special · 30m',
    duration: '30m',
    date: 'Channel 4 Sport Exclusive',
    type: 'tech',
    description:
      'David Coulthard breaks down the latest front wing flex controversy, venturi tunnel ground effects, and how McLaren found performance gains in the wind tunnel.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://flive.dpdns.org/stream',
    presenters: ['David Coulthard'],
  },
];

export const Channel4WebsiteView: React.FC<Channel4WebsiteViewProps> = ({
  currentLeader,
  flagStatus,
  currentLap,
  totalLaps,
  vpnState,
  onOpenVpnModal,
  onSwitchToOpenF1,
  onSwitchToSkyF1,
}) => {
  const [activeTab, setActiveTab] = useState<'watch' | 'episodes' | 'schedule' | 'presenters' | 'embed-portal'>('watch');
  const [selectedEpisode, setSelectedEpisode] = useState<C4Episode>(C4_EPISODES[0]);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);
  const [streamServer, setStreamServer] = useState<'server1' | 'server2' | 'clean'>('server1');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showOpenf1Overlay, setShowOpenf1Overlay] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(324);
  const [simRpm, setSimRpm] = useState<number>(11820);
  const [simGear, setSimGear] = useState<number>(8);
  const [streamQuality, setStreamQuality] = useState<'1080p' | '720p' | 'Auto'>('1080p');

  const C4_OFFICIAL_URL = 'https://www.channel4.com/programmes/formula-1';

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setSimSpeed((prev) => {
        const delta = Math.round((Math.random() - 0.48) * 8);
        const next = Math.max(120, Math.min(355, prev + delta));
        setSimGear(next > 305 ? 8 : next > 255 ? 7 : next > 200 ? 6 : 5);
        setSimRpm(Math.round(next > 290 ? 11600 + Math.random() * 400 : 9400 + (next % 40) * 50));
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const getStreamUrl = () => {
    if (streamServer === 'clean') return 'https://f1live.dpdns.org/stream';
    return selectedEpisode.streamUrl;
  };

  const isUkVpn = vpnState?.isConnected && vpnState?.currentServer?.isUk;

  return (
    <div className="flex flex-col bg-[#0b0e14] text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* 1. CHANNEL 4 OFFICIAL WEBSITE BROWSER TOP BAR */}
      <div className="bg-[#050608] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Browser address emulation */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-xl bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">https://</span>
          </div>
          <span className="text-white font-semibold">www.channel4.com</span>
          <span className="text-[#00E5FF]">/programmes/formula-1</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* UK VPN Status Badge */}
          <button
            onClick={onOpenVpnModal}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isUkVpn
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
            }`}
            title="Channel 4 UK Geolocation verification"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isUkVpn ? 'UK Verified (London)' : 'Connect UK VPN for C4'}</span>
          </button>

          <a
            href={C4_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] border border-[#00E5FF]/40 font-mono font-bold flex items-center gap-1.5 transition-all text-xs"
            title="Open official Channel 4 Formula 1 page in new window"
          >
            <span>channel4.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Reload Channel 4 Feed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CHANNEL 4 UK BRANDED NAVIGATION HEADER */}
      <div className="bg-[#121620] border-b border-white/10 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Channel 4 Iconic Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('watch')}>
            {/* Authentic Channel 4 3D Block Logo */}
            <div className="w-9 h-9 rounded-lg bg-[#00E5FF] flex items-center justify-center text-black font-black font-mono text-xl shadow-lg shadow-[#00E5FF]/30 tracking-tighter">
              4
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-wider font-f1 uppercase">
                  Channel 4
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#00E5FF] text-black text-[10px] font-black font-mono tracking-tight">
                  UK
                </span>
              </div>
              <div className="text-[11px] text-[#00E5FF] font-mono font-semibold flex items-center gap-1">
                <span>Free-to-Air Terrestrial Television</span>
                <span>·</span>
                <span>All 4 Sport</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channel 4 Internal Site Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('watch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'watch'
                ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Watch Live in Website</span>
          </button>

          <button
            onClick={() => setActiveTab('episodes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'episodes'
                ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Episodes &amp; Catch Up ({C4_EPISODES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('presenters')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'presenters'
                ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Presenters &amp; DC Team</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>UK Broadcast Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('embed-portal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'embed-portal'
                ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Channel4.com Portal</span>
          </button>
        </div>

        {/* Quick alternative switches */}
        <div className="flex items-center gap-2">
          {onSwitchToOpenF1 && (
            <button
              onClick={onSwitchToOpenF1}
              className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Switch to OpenF1 Live Telemetry"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>OpenF1 Hub</span>
            </button>
          )}

          {onSwitchToSkyF1 && (
            <button
              onClick={onSwitchToSkyF1}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <span>Sky Sports F1</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TAB 1: WATCH LIVE IN WEBSITE (PRIMARY BROADCAST PLAYER) */}
      {activeTab === 'watch' && (
        <div className="flex flex-col">
          {/* Channel 4 Hero Broadcast Banner */}
          <div className="relative bg-gradient-to-r from-[#00E5FF]/10 via-[#0d1624] to-[#07090e] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#00E5FF] text-black font-black text-[10px] font-mono tracking-wider">
                  LIVE BROADCAST
                </span>
                <span className="text-xs text-[#00E5FF] font-mono font-bold">
                  Channel 4 UK (Freeview Channel 15 · Sky 104 · Virgin 104)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white font-f1 uppercase tracking-wide">
                Formula 1® on Channel 4: {selectedEpisode.title}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Award-winning terrestrial UK coverage by Whisper Films. Steve Jones, 13-time Grand Prix winner David Coulthard, and Mark Webber bring you insight, driver interviews, and full trackside analysis.
              </p>
            </div>

            {/* In-Player Broadcast Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* Server selector */}
              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
                <button
                  onClick={() => setStreamServer('server1')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    streamServer === 'server1'
                      ? 'bg-[#00E5FF] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  UK Server 1
                </button>
                <button
                  onClick={() => setStreamServer('server2')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    streamServer === 'server2'
                      ? 'bg-[#00E5FF] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Server 2
                </button>
                <button
                  onClick={() => setStreamServer('clean')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    streamServer === 'clean'
                      ? 'bg-[#00E5FF] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Clean Feed
                </button>
              </div>

              {/* OpenF1 Sync Overlay Toggle */}
              <button
                onClick={() => setShowOpenf1Overlay(!showOpenf1Overlay)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  showOpenf1Overlay
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                }`}
                title="Overlay real-time OpenF1 car telemetry"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>OpenF1 HUD: {showOpenf1Overlay ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* MAIN EMBEDDED VIDEO VIEWPORT */}
          <div className="relative w-full aspect-video min-h-[380px] lg:min-h-[520px] bg-black overflow-hidden flex items-center justify-center">
            {/* Live Stream Iframe */}
            <iframe
              key={`c4-video-${iframeKey}-${streamServer}`}
              src={getStreamUrl()}
              title="Channel 4 UK F1 Live Player"
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              referrerPolicy="no-referrer"
            />

            {/* CHANNEL 4 UK ON-SCREEN WATERMARK / DOG */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#00E5FF]/40 shadow-xl">
              <div className="w-6 h-6 rounded bg-[#00E5FF] flex items-center justify-center font-black text-black font-mono text-xs">
                4
              </div>
              <div className="text-left font-mono">
                <div className="text-[11px] font-black text-white flex items-center gap-1">
                  <span>CHANNEL 4 HD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="text-[9px] text-[#00E5FF]">FORMULA 1 LIVE</div>
              </div>
            </div>

            {/* Quality & Audio Badges */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white">
                1080p 60FPS
              </span>
              <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-[#00E5FF]">
                STEREO / 5.1
              </span>
            </div>

            {/* OpenF1 Live Car Telemetry Heads-Up Overlay */}
            {showOpenf1Overlay && (
              <div className="absolute top-16 right-4 z-20 bg-black/85 backdrop-blur-md border border-[#00E5FF]/40 rounded-xl p-3 w-64 shadow-2xl font-mono text-xs pointer-events-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white">OpenF1 Sync (20Hz)</span>
                  </div>
                  <span className="text-[10px] text-[#00E5FF]">#4 NORRIS</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-[10px] text-neutral-400">SPEED</div>
                    <div className="text-xl font-black text-white font-mono-nums">{simSpeed} <span className="text-[10px] font-normal text-neutral-400">km/h</span></div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-[10px] text-neutral-400">GEAR / RPM</div>
                    <div className="text-xl font-black text-yellow-400 font-mono-nums">G{simGear} <span className="text-xs text-neutral-400">{simRpm}</span></div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-neutral-400 text-center">
                  Synchronized with Channel 4 commentary feed
                </div>
              </div>
            )}

            {/* In-Video Mini Race Timing Bar */}
            {currentLeader && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs text-white shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-[#00E5FF] text-black font-black font-f1 tracking-wider text-[11px]">
                    LAP {currentLap}/{totalLaps}
                  </span>
                  <div className="flex items-center gap-2 font-semibold">
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

                <div className="hidden sm:flex items-center gap-4 text-neutral-300 font-mono-nums text-[11px]">
                  <div>
                    <span className="text-neutral-500">SPEED: </span>
                    <span className="text-white font-bold">{currentLeader.currentSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">GEAR: </span>
                    <span className="text-yellow-400 font-bold">{currentLeader.currentGear}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">DRS: </span>
                    <span className={currentLeader.drsActive ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {currentLeader.drsActive ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player Bottom Control & Metadata Bar */}
          <div className="bg-[#121620] border-t border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-f1 flex items-center gap-2">
                  <span>Channel 4 Television Broadcast Feed</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    ONLINE
                  </span>
                </div>
                <div className="text-xs text-neutral-400">
                  Commentary: Steve Jones, David Coulthard &amp; Mark Webber
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('episodes')}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Browse Catch-Up Episodes</span>
              </button>

              <a
                href={C4_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00cbe2] text-black text-xs font-mono font-bold transition-all shadow-md shadow-[#00E5FF]/20 flex items-center gap-1.5"
              >
                <span>Launch Channel 4 Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: EPISODES & ON-DEMAND CATCH UP (ALL 4 STYLE) */}
      {activeTab === 'episodes' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
                All 4 / Channel 4 On Demand
              </div>
              <h3 className="text-xl font-black text-white font-f1 uppercase tracking-wide mt-0.5">
                Formula 1® Series Episodes &amp; Highlights
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                Stream full qualifying highlights, Grand Prix race showcase, behind-the-scenes paddock features, and technical breakdowns on Channel 4.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedEpisode(C4_EPISODES[0]);
                setActiveTab('watch');
              }}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00cbe2] text-black text-xs font-mono font-black flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Latest Episode</span>
            </button>
          </div>

          {/* Episode Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {C4_EPISODES.map((ep) => {
              const isSelected = selectedEpisode.id === ep.id;
              return (
                <div
                  key={ep.id}
                  className={`flex flex-col bg-[#131722] rounded-xl border overflow-hidden transition-all duration-200 hover:border-[#00E5FF]/50 ${
                    isSelected
                      ? 'border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 ring-1 ring-[#00E5FF]'
                      : 'border-white/10'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={ep.thumbnailUrl}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#00E5FF] text-black font-black text-[10px] font-mono uppercase">
                        {ep.type}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                      {ep.duration}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEpisode(ep);
                        setActiveTab('watch');
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-[#00E5FF] font-mono font-semibold">
                        {ep.subtitle}
                      </div>
                      <h4 className="text-sm font-bold text-white font-f1 line-clamp-1">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[11px] text-neutral-400">
                        <span>Featuring: </span>
                        <strong className="text-white">{ep.presenters.join(', ')}</strong>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEpisode(ep);
                          setActiveTab('watch');
                        }}
                        className="px-3 py-1 rounded bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: PRESENTERS & CHANNEL 4 BROADCAST TEAM */}
      {activeTab === 'presenters' && (
        <div className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <div className="text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
              Whisper Films Production for Channel 4
            </div>
            <h3 className="text-xl font-black text-white font-f1 uppercase tracking-wide mt-0.5">
              Channel 4 Formula 1 Presenting &amp; Pundit Team
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Meet the iconic presenting line-up that has won BAFTA and RTS sports awards for Channel 4's Grand Prix coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: 'Steve Jones',
                role: 'Lead Anchor & Presenter',
                bio: 'The charismatic face of Channel 4 F1 since 2016. Anchors all live and highlight shows with high energy, sharp banter, and deep racing curiosity.',
                badge: 'BAFTA Winner',
              },
              {
                name: 'David Coulthard MBE',
                role: 'Co-Host & Chief Analyst',
                bio: '13-time Formula 1 Grand Prix winner and former Williams, McLaren, and Red Bull driver. Provides razor-sharp race craft analysis and driver psychology insights.',
                badge: '13x GP Winner',
              },
              {
                name: 'Mark Webber AO',
                role: 'Co-Host & Expert Pundit',
                bio: '9-time Grand Prix winner for Red Bull Racing and FIA World Endurance Champion. Known for his no-nonsense driver perspective and manager of Oscar Piastri.',
                badge: '9x GP Winner',
              },
              {
                name: 'Lee McKenzie',
                role: 'Senior Paddock Reporter',
                bio: 'Veteran Formula 1 broadcast journalist with unrivaled access to team principals and drivers in the media pen and pit lane.',
                badge: 'Paddock Insider',
              },
              {
                name: 'Billy Monger',
                role: 'Analyst & Pit Lane Co-Host',
                bio: 'Inspirational racing driver and commentator who brings fresh, dynamic technical analysis and telemetry breakdowns to Channel 4.',
                badge: 'Rising Star',
              },
              {
                name: 'Alice Powell',
                role: 'Driver Analyst & F1 Academy Expert',
                bio: 'Formula Renault and W Series race winner providing expert technical commentary and tire compound management breakdown.',
                badge: 'Pro Driver',
              },
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#131722] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center font-bold text-white font-mono">
                    {p.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono font-bold">
                    {p.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-f1">{p.name}</h4>
                  <div className="text-xs text-[#00E5FF] font-mono font-semibold">{p.role}</div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: CHANNEL 4 UK BROADCAST SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <div className="text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
              2024 / 2025 Calendar
            </div>
            <h3 className="text-xl font-black text-white font-f1 uppercase tracking-wide mt-0.5">
              Channel 4 UK Terrestrial Broadcast Schedule
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              All 24 Formula 1 race weekends are covered free-to-air on Channel 4 with comprehensive highlights and full live coverage of the British Grand Prix.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                round: 'Round 17',
                gp: 'Azerbaijan Grand Prix (Baku)',
                qualiC4: 'Saturday 19:30 BST (Highlights)',
                raceC4: 'Sunday 18:30 BST (Highlights)',
                channel: 'Channel 4 & All 4',
                status: 'CURRENT RACE',
                isCurrent: true,
              },
              {
                round: 'Round 18',
                gp: 'Singapore Grand Prix (Marina Bay)',
                qualiC4: 'Saturday 19:00 BST (Highlights)',
                raceC4: 'Sunday 18:30 BST (Highlights)',
                channel: 'Channel 4 & All 4',
                status: 'UPCOMING',
                isCurrent: false,
              },
              {
                round: 'Round 19',
                gp: 'United States Grand Prix (Austin)',
                qualiC4: 'Saturday 22:30 BST (Highlights)',
                raceC4: 'Sunday 23:00 BST (Highlights)',
                channel: 'Channel 4 & All 4',
                status: 'UPCOMING',
                isCurrent: false,
              },
              {
                round: 'Round 20',
                gp: 'Mexico City Grand Prix (Autódromo)',
                qualiC4: 'Saturday 23:00 BST (Highlights)',
                raceC4: 'Sunday 23:30 BST (Highlights)',
                channel: 'Channel 4 & All 4',
                status: 'UPCOMING',
                isCurrent: false,
              },
              {
                round: 'Flagship Event',
                gp: 'British Grand Prix (Silverstone)',
                qualiC4: 'LIVE: Qualifying & Build-up (Full)',
                raceC4: 'LIVE: Race Day Terrestrial Broadcast',
                channel: 'Channel 4 UK (100% Free-to-Air Live)',
                status: 'LIVE FLAGSHIP',
                isCurrent: false,
              },
            ].map((sch, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
                  sch.isCurrent
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40'
                    : 'bg-[#131722] border-white/5'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                      {sch.round}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        sch.isCurrent
                          ? 'bg-[#00E5FF] text-black'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-f1">{sch.gp}</h4>
                  <div className="text-xs text-[#00E5FF] font-mono">{sch.channel}</div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono">
                  <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                    <div className="text-neutral-400 text-[10px]">QUALIFYING:</div>
                    <div className="text-white font-bold">{sch.qualiC4}</div>
                  </div>
                  <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                    <div className="text-neutral-400 text-[10px]">RACE SHOW:</div>
                    <div className="text-white font-bold">{sch.raceC4}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: OFFICIAL CHANNEL4.COM WEBSITE PORTAL / EMBED */}
      {activeTab === 'embed-portal' && (
        <div className="flex flex-col h-[650px] relative bg-black">
          {/* Top portal header */}
          <div className="bg-[#121620] border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-neutral-300">Live Frame:</span>
              <span className="text-[#00E5FF] font-bold">channel4.com/programmes/formula-1</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={C4_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-[#00E5FF] text-black font-bold flex items-center gap-1.5 hover:bg-[#00cbe2] transition-colors"
              >
                <span>Open Direct in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <iframe
            key={`c4-portal-${iframeKey}`}
            src={C4_OFFICIAL_URL}
            title="Official Channel 4 Formula 1 Website"
            className="w-full flex-1 border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          />

          <div className="p-3 bg-[#0a0d14] border-t border-white/10 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
            <span>Note: If your browser restricts direct cross-origin iframe security headers on channel4.com, click "Open Direct in Browser" above or switch to the "Watch Live in Website" tab.</span>
            <button
              onClick={() => setActiveTab('watch')}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white font-mono font-bold cursor-pointer"
            >
              Switch to In-Website Player
            </button>
          </div>
        </div>
      )}

      {/* 8. FOOTER BAR */}
      <div className="bg-[#080a0f] border-t border-white/10 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>Channel 4 UK F1 Experience</span>
          </div>
          <span>·</span>
          <span>Broadcasting to over 4.5 million UK viewers per Grand Prix</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://www.channel4.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            All 4 Network
          </a>
          <a
            href={C4_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            <span>channel4.com/programmes/formula-1</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
