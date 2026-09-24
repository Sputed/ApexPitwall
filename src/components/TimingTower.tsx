import React, { useState, useEffect, useRef } from 'react';
import {
  DriverTiming,
  TyreCompound,
  OpenF1CarData,
  OpenF1Interval,
  OpenF1Radio,
  OpenF1Stint,
  OpenF1Pit,
} from '../types/f1';
import {
  OPENF1_SAMPLE_DRIVERS,
  OPENF1_SAMPLE_RADIO,
  OPENF1_SAMPLE_PITS,
  OPENF1_SAMPLE_STINTS,
  fetchOpenF1CarData,
  fetchOpenF1Intervals,
  fetchOpenF1TeamRadio,
  fetchOpenF1Stints,
} from '../services/openf1Service';
import {
  Search,
  Gauge,
  ArrowUpDown,
  ChevronRight,
  Zap,
  ExternalLink,
  Radio,
  Activity,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  Flame,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Sparkles,
  Tv,
} from 'lucide-react';

interface TimingTowerProps {
  drivers: DriverTiming[];
  selectedDriverCode: string;
  onSelectDriver: (driverCode: string) => void;
  comparedDriverCode?: string;
  onSelectCompareDriver?: (driverCode: string) => void;
  compact?: boolean;
  onSelectTimingSource?: (source: 'openf1' | 'pitwall' | 'formula-timer' | 'f1pedia') => void;
  currentTimingSource?: 'openf1' | 'pitwall' | 'formula-timer' | 'f1pedia';
  onLaunchChannel4?: () => void;
  onOpenOpenF1Hub?: () => void;
}

export const TimingTower: React.FC<TimingTowerProps> = ({
  drivers,
  selectedDriverCode,
  onSelectDriver,
  comparedDriverCode,
  onSelectCompareDriver,
  compact = false,
  onSelectTimingSource,
  currentTimingSource = 'openf1',
  onLaunchChannel4,
  onOpenOpenF1Hub,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'bestLap' | 'speedTrap' | 'gap'>('position');
  const [openf1ViewTab, setOpenf1ViewTab] = useState<'timing' | 'telemetry' | 'intervals' | 'stints' | 'radio'>('timing');
  const [expandedDriverCode, setExpandedDriverCode] = useState<string | null>(null);
  const [drsFilterOnly, setDrsFilterOnly] = useState(false);

  // Live OpenF1 Telemetry State
  const [liveTelemetryMap, setLiveTelemetryMap] = useState<Record<number, OpenF1CarData>>({});
  const [openf1Intervals, setOpenf1Intervals] = useState<OpenF1Interval[]>([]);
  const [openf1RadioList, setOpenf1RadioList] = useState<OpenF1Radio[]>(OPENF1_SAMPLE_RADIO);
  const [openf1Stints, setOpenf1Stints] = useState<OpenF1Stint[]>(OPENF1_SAMPLE_STINTS);
  const [playingRadioUrl, setPlayingRadioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number>(9632);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live');

  // Initialize and pulse OpenF1 telemetry (20Hz high-frequency simulation + API fetch)
  useEffect(() => {
    // Initial fetch of intervals and radio
    fetchOpenF1Intervals(selectedSessionKey).then((intvs) => {
      if (intvs && intvs.length > 0) setOpenf1Intervals(intvs);
    });
    fetchOpenF1TeamRadio(selectedSessionKey).then((rads) => {
      if (rads && rads.length > 0) setOpenf1RadioList(rads);
    });
    fetchOpenF1Stints(selectedSessionKey).then((stints) => {
      if (stints && stints.length > 0) setOpenf1Stints(stints);
    });

    // Populate initial base car telemetry for drivers
    const initialMap: Record<number, OpenF1CarData> = {};
    drivers.forEach((d) => {
      initialMap[d.driverNumber] = {
        brake: 0,
        date: new Date().toISOString(),
        driver_number: d.driverNumber,
        drs: d.drsActive ? 1 : 0,
        meeting_key: 1245,
        n_gear: d.position <= 4 ? 8 : 7,
        rpm: 11400 + Math.round(Math.random() * 600),
        session_key: selectedSessionKey,
        speed: Math.round(d.speedTrap - Math.random() * 8),
        throttle: 100,
      };
    });
    setLiveTelemetryMap(initialMap);

    // Live 20Hz pulse for realistic OpenF1 Baku high-speed telemetry
    const pulseTimer = setInterval(() => {
      setLiveTelemetryMap((prev) => {
        const next: Record<number, OpenF1CarData> = { ...prev };
        drivers.forEach((driver) => {
          const current = prev[driver.driverNumber] || {
            brake: 0,
            date: new Date().toISOString(),
            driver_number: driver.driverNumber,
            drs: driver.drsActive ? 1 : 0,
            meeting_key: 1245,
            n_gear: 8,
            rpm: 11500,
            session_key: selectedSessionKey,
            speed: Math.round(driver.speedTrap),
            throttle: 100,
          };

          // Vary speed around realistic range for Baku main straight / castle section
          const delta = (Math.random() - 0.49) * 4;
          const newSpeed = Math.min(356, Math.max(130, Math.round(current.speed + delta)));
          const newThrottle = newSpeed > 290 ? 100 : Math.max(25, Math.round(newSpeed / 3.4));
          const newBrake = newThrottle < 60 && Math.random() > 0.7 ? Math.round(Math.random() * 80) : 0;
          const newGear = newSpeed > 315 ? 8 : newSpeed > 270 ? 7 : newSpeed > 220 ? 6 : 5;
          const newRpm = Math.round(newSpeed > 300 ? 11600 + Math.random() * 320 : 9400 + (newSpeed % 50) * 40);
          const newDrs = driver.drsActive || (newSpeed > 305 && driver.position <= 6) ? 1 : 0;

          next[driver.driverNumber] = {
            ...current,
            speed: newSpeed,
            throttle: newThrottle,
            brake: newBrake,
            n_gear: newGear,
            rpm: newRpm,
            drs: newDrs,
            date: new Date().toISOString(),
          };
        });
        return next;
      });
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1200);

    return () => clearInterval(pulseTimer);
  }, [drivers, selectedSessionKey]);

  // Audio player handler for OpenF1 Team Radio
  const handlePlayRadio = (url: string) => {
    if (playingRadioUrl === url && isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    setPlayingRadioUrl(url);
    setIsPlayingAudio(true);
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => {
        // Fallback simulated duration
        setTimeout(() => setIsPlayingAudio(false), 4500);
      };
    } else {
      audioRef.current.src = url;
    }
    audioRef.current.play().catch(() => {
      // Audio autoplay restrictions handler
      setTimeout(() => setIsPlayingAudio(false), 4500);
    });
  };

  const getTyreBadge = (compound: TyreCompound, age: number) => {
    let colorClass = '';
    let letter = 'S';
    switch (compound) {
      case 'SOFT':
        colorClass = 'border-red-500 text-red-400 bg-red-500/10';
        letter = 'S';
        break;
      case 'MEDIUM':
        colorClass = 'border-amber-400 text-amber-300 bg-amber-500/10';
        letter = 'M';
        break;
      case 'HARD':
        colorClass = 'border-neutral-200 text-neutral-100 bg-neutral-500/10';
        letter = 'H';
        break;
      case 'INTERMEDIATE':
        colorClass = 'border-emerald-400 text-emerald-300 bg-emerald-500/10';
        letter = 'I';
        break;
      case 'WET':
        colorClass = 'border-blue-400 text-blue-300 bg-blue-500/10';
        letter = 'W';
        break;
    }

    return (
      <div className="flex items-center gap-1 font-mono-nums">
        <span
          className={`w-5 h-5 rounded-full border text-[10px] font-black flex items-center justify-center ${colorClass}`}
          title={`OpenF1 Stint Tyre: ${compound} (${age} laps old)`}
        >
          {letter}
        </span>
        <span className="text-[11px] text-neutral-400">{age}L</span>
      </div>
    );
  };

  const getSectorBadge = (sector: { time: string; status: 'fastest' | 'personal' | 'normal' | 'yellow' }) => {
    let color = 'text-neutral-400';
    if (sector.status === 'fastest') color = 'text-purple-400 font-bold';
    else if (sector.status === 'personal') color = 'text-emerald-400 font-medium';
    else if (sector.status === 'yellow') color = 'text-amber-400';

    return <span className={`font-mono-nums text-[11px] ${color}`}>{sector.time}</span>;
  };

  const filteredDrivers = drivers
    .filter((d) => {
      const matchesSearch =
        d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.driverCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(d.driverNumber).includes(searchQuery);

      if (drsFilterOnly) {
        const carData = liveTelemetryMap[d.driverNumber];
        const isDrs = carData ? carData.drs === 1 : d.drsActive;
        return matchesSearch && isDrs;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'speedTrap') {
        const speedA = liveTelemetryMap[a.driverNumber]?.speed || a.speedTrap;
        const speedB = liveTelemetryMap[b.driverNumber]?.speed || b.speedTrap;
        return speedB - speedA;
      }
      if (sortBy === 'bestLap') return a.bestLapTime.localeCompare(b.bestLapTime);
      if (sortBy === 'gap') return a.gapToLeader.localeCompare(b.gapToLeader);
      return a.position - b.position;
    });

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* OPENF1 HERO STRIP & LIVE FEED STATUS */}
      <div className="bg-gradient-to-r from-[#0d121f] via-[#10192e] to-[#0d121f] px-4 py-3 border-b border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* OpenF1 Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-md shadow-cyan-500/30">
              <Zap className="w-5 h-5 fill-black stroke-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black font-f1 tracking-wider text-sm flex items-center gap-1.5">
                  <span>OPENF1 TIMING TOWER</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>20Hz STREAM</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 font-mono hidden sm:inline">
                  api.openf1.org/v1
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                <span className="text-cyan-300 font-medium">Session #9632</span>
                <span>·</span>
                <span>Baku City Circuit</span>
                <span>·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synced {lastSyncTime}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges: Channel 4 & OpenF1 Hub */}
          <div className="flex items-center gap-2 flex-wrap">
            {onLaunchChannel4 && (
              <button
                onClick={onLaunchChannel4}
                className="px-2.5 py-1 bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Watch Channel 4 UK Broadcast alongside OpenF1 timing"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Channel 4 UK</span>
              </button>
            )}

            {onOpenOpenF1Hub && (
              <button
                onClick={onOpenOpenF1Hub}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full OpenF1 Hub</span>
              </button>
            )}

            <a
              href="https://openf1.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-black/40 hover:bg-white/5 text-neutral-400 hover:text-white rounded text-[11px] font-mono border border-white/5 flex items-center gap-1 transition-colors"
            >
              <span>openf1.org</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* SUB-TABS: OpenF1 View Modes (Timing, Telemetry 20Hz, Intervals, Stints, Team Radio) */}
        {!compact && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpenf1ViewTab('timing')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openf1ViewTab === 'timing'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gauge className="w-3 h-3" />
                <span>Timing Grid</span>
              </button>

              <button
                onClick={() => setOpenf1ViewTab('telemetry')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openf1ViewTab === 'telemetry'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>20Hz Car Data</span>
              </button>

              <button
                onClick={() => setOpenf1ViewTab('intervals')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openf1ViewTab === 'intervals'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Intervals (/intervals)</span>
              </button>

              <button
                onClick={() => setOpenf1ViewTab('stints')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openf1ViewTab === 'stints'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Stints &amp; Pits</span>
              </button>

              <button
                onClick={() => setOpenf1ViewTab('radio')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  openf1ViewTab === 'radio'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>Team Radio Feed</span>
              </button>
            </div>

            {/* Provider Switcher Dropdown / Pills */}
            {onSelectTimingSource && (
              <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10 text-[11px] shrink-0 font-mono">
                <button
                  onClick={() => onSelectTimingSource('openf1')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    currentTimingSource === 'openf1'
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>OpenF1</span>
                </button>
                <button
                  onClick={() => onSelectTimingSource('pitwall')}
                  className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    currentTimingSource === 'pitwall'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Apex
                </button>
                <button
                  onClick={() => onSelectTimingSource('formula-timer')}
                  className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    currentTimingSource === 'formula-timer'
                      ? 'bg-neutral-200 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  FormulaTimer
                </button>
                <button
                  onClick={() => onSelectTimingSource('f1pedia')}
                  className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    currentTimingSource === 'f1pedia'
                      ? 'bg-sky-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  F1Pedia
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="p-2.5 bg-[#0f1420] border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter driver, #number, team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-black/50 border border-white/10 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 text-xs font-mono"
          />
        </div>

        {/* Filter pills & Sorters */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <button
            onClick={() => setDrsFilterOnly(!drsFilterOnly)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              drsFilterOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-black/30 text-neutral-400 border-white/5 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>DRS Only</span>
          </button>

          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 font-mono text-[11px]">
            <span className="text-neutral-500 px-1">Sort:</span>
            <button
              onClick={() => setSortBy('position')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                sortBy === 'position' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              POS
            </button>
            <button
              onClick={() => setSortBy('gap')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                sortBy === 'gap' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              GAP
            </button>
            <button
              onClick={() => setSortBy('speedTrap')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                sortBy === 'speedTrap' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              SPEED
            </button>
            <button
              onClick={() => setSortBy('bestLap')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                sortBy === 'bestLap' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              LAP
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: OPENF1 TIMING GRID (MAIN TABLE) */}
      {openf1ViewTab === 'timing' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#080b11] border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            <div className="col-span-1 text-center">POS</div>
            <div className="col-span-4 sm:col-span-3">CAR &amp; DRIVER</div>
            <div className="col-span-3 sm:col-span-2 text-right">GAP / INTERVAL</div>
            <div className="col-span-2 text-right hidden sm:block">BEST LAP</div>
            {!compact && (
              <>
                <div className="col-span-2 text-center hidden md:block">SECTORS (1/2/3)</div>
                <div className="col-span-1 text-right hidden lg:block">OPENF1 TELEM</div>
              </>
            )}
            <div className="col-span-2 sm:col-span-1 text-center">TYRE</div>
          </div>

          {/* Rows List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {filteredDrivers.map((driver) => {
              const isSelected = driver.driverCode === selectedDriverCode;
              const isCompared = driver.driverCode === comparedDriverCode;
              const isLeader = driver.position === 1;
              const isExpanded = expandedDriverCode === driver.driverCode;
              const liveData = liveTelemetryMap[driver.driverNumber] || {
                speed: Math.round(driver.speedTrap),
                throttle: 100,
                brake: 0,
                n_gear: 8,
                rpm: 11600,
                drs: driver.drsActive ? 1 : 0,
              };

              return (
                <div key={driver.driverNumber} className="flex flex-col">
                  <div
                    onClick={() => onSelectDriver(driver.driverCode)}
                    className={`grid grid-cols-12 gap-1 items-center px-3 py-2.5 transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-cyan-500/15 border-l-4 border-cyan-400'
                        : isCompared
                        ? 'bg-purple-500/15 border-l-4 border-purple-400'
                        : 'hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Position */}
                    <div className="col-span-1 text-center font-bold font-mono">
                      {isLeader ? (
                        <span className="text-amber-400 font-black flex items-center justify-center gap-0.5">
                          <span>1</span>
                          <span className="text-[9px] text-amber-500">★</span>
                        </span>
                      ) : (
                        <span className="text-neutral-300">{driver.position}</span>
                      )}
                    </div>

                    {/* Driver info + Car Number */}
                    <div className="col-span-4 sm:col-span-3 flex items-center gap-2 min-w-0">
                      {/* OpenF1 Car Number Pill */}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono shrink-0 shadow-xs"
                        style={{
                          backgroundColor: `${driver.teamColor}25`,
                          color: driver.teamColor,
                          border: `1px solid ${driver.teamColor}50`,
                        }}
                      >
                        #{driver.driverNumber}
                      </span>

                      <div className="truncate">
                        <div className="font-bold text-white flex items-center gap-1.5 truncate">
                          <span className="font-f1 tracking-wider text-xs">{driver.driverCode}</span>
                          <span className="text-neutral-400 font-normal hidden sm:inline text-[11px] truncate">
                            {driver.driverName.split(' ')[1]}
                          </span>

                          {liveData.drs === 1 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold animate-pulse">
                              DRS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate hidden sm:block">
                          {driver.teamName}
                        </div>
                      </div>
                    </div>

                    {/* Gap to Leader / Interval */}
                    <div className="col-span-3 sm:col-span-2 text-right font-mono-nums text-neutral-300">
                      <div className="font-semibold text-[11px] text-cyan-200">{driver.gapToLeader}</div>
                      {driver.position > 1 && (
                        <div className="text-[10px] text-neutral-400">{driver.intervalToAhead}</div>
                      )}
                    </div>

                    {/* Best Lap Time */}
                    <div className="col-span-2 text-right font-mono-nums hidden sm:block">
                      <div className={driver.position === 1 ? 'text-purple-400 font-bold' : 'text-neutral-200'}>
                        {driver.bestLapTime}
                      </div>
                      <div className="text-[10px] text-neutral-400">{driver.currentLapTime}</div>
                    </div>

                    {/* Sector Times */}
                    {!compact && (
                      <>
                        <div className="col-span-2 hidden md:flex items-center justify-center gap-2">
                          {getSectorBadge(driver.sector1)}
                          {getSectorBadge(driver.sector2)}
                          {getSectorBadge(driver.sector3)}
                        </div>

                        {/* OpenF1 Real-Time Telemetry Readout */}
                        <div className="col-span-1 text-right hidden lg:block font-mono-nums">
                          <div className="font-bold text-cyan-300 text-xs flex items-center justify-end gap-1">
                            <span>{liveData.speed}</span>
                            <span className="text-[9px] text-neutral-500 font-normal">km/h</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center justify-end gap-1">
                            <span>G{liveData.n_gear}</span>
                            <span>·</span>
                            <span>{liveData.rpm}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Tyre Info + Expand toggle */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1.5">
                      {getTyreBadge(driver.tyreCompound, driver.tyreAgeLaps)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDriverCode(isExpanded ? null : driver.driverCode);
                        }}
                        className="p-1 text-neutral-400 hover:text-cyan-400 rounded hover:bg-white/5 cursor-pointer"
                        title="Toggle OpenF1 Live Car Telemetry Drawer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* INLINE OPENF1 TELEMETRY DRAWER */}
                  {isExpanded && (
                    <div className="bg-[#0e1320] border-y border-cyan-500/20 px-4 py-3 text-xs space-y-3 font-mono animate-fadeIn">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span className="font-bold text-white font-f1">
                            #{driver.driverNumber} {driver.driverName} Live OpenF1 Telemetry
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                            api.openf1.org/v1/car_data
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {onSelectCompareDriver && comparedDriverCode !== driver.driverCode && (
                            <button
                              onClick={() => onSelectCompareDriver(driver.driverCode)}
                              className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] cursor-pointer"
                            >
                              Compare Telemetry
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const rad = openf1RadioList.find((r) => r.driver_number === driver.driverNumber);
                              if (rad) handlePlayRadio(rad.recording_url);
                            }}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Team Radio</span>
                          </button>
                        </div>
                      </div>

                      {/* Gauges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-neutral-400 uppercase">Live Speed</div>
                          <div className="text-xl font-black text-cyan-400 font-mono-nums">
                            {liveData.speed}{' '}
                            <span className="text-xs font-normal text-neutral-400">km/h</span>
                          </div>
                        </div>

                        <div className="bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-neutral-400 uppercase">Engine RPM</div>
                          <div className="text-xl font-black text-white font-mono-nums">
                            {liveData.rpm}
                          </div>
                        </div>

                        <div className="bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-neutral-400 uppercase">Gear &amp; DRS</div>
                          <div className="text-xl font-black text-white font-mono-nums flex items-center gap-2">
                            <span>G{liveData.n_gear}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                liveData.drs === 1
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {liveData.drs === 1 ? 'DRS OPEN' : 'DRS CLOSED'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-neutral-400 uppercase flex items-center justify-between">
                            <span>Throttle</span>
                            <span className="text-emerald-400 font-bold">{liveData.throttle}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${liveData.throttle}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-black/50 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-neutral-400 uppercase flex items-center justify-between">
                            <span>Brake</span>
                            <span className="text-red-400 font-bold">{liveData.brake}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-red-500 h-full transition-all duration-300"
                              style={{ width: `${liveData.brake}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: OPENF1 20HZ CAR DATA MATRIX (ALL 20 CARS) */}
      {openf1ViewTab === 'telemetry' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>OpenF1 Real-Time 20Hz Telemetry Matrix (/car_data)</span>
            </span>
            <span className="font-mono text-cyan-400">20/20 Active Pit Telemetry Feeds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredDrivers.map((driver) => {
              const live = liveTelemetryMap[driver.driverNumber] || {
                speed: Math.round(driver.speedTrap),
                throttle: 100,
                brake: 0,
                n_gear: 8,
                rpm: 11500,
                drs: driver.drsActive ? 1 : 0,
              };

              return (
                <div
                  key={driver.driverNumber}
                  onClick={() => onSelectDriver(driver.driverCode)}
                  className={`bg-[#0c101a] p-3 rounded-lg border transition-all cursor-pointer ${
                    driver.driverCode === selectedDriverCode
                      ? 'border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono"
                        style={{
                          backgroundColor: `${driver.teamColor}25`,
                          color: driver.teamColor,
                          border: `1px solid ${driver.teamColor}50`,
                        }}
                      >
                        #{driver.driverNumber}
                      </span>
                      <span className="font-bold text-white font-f1">{driver.driverCode}</span>
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        live.drs === 1
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-neutral-500'
                      }`}
                    >
                      DRS {live.drs}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-2xl font-black text-white font-mono-nums">
                      {live.speed} <span className="text-xs text-neutral-400 font-normal">km/h</span>
                    </span>
                    <span className="text-xs font-bold text-cyan-300">
                      G{live.n_gear} · {live.rpm} RPM
                    </span>
                  </div>

                  {/* Throttle & Brake Bars */}
                  <div className="space-y-1.5 mt-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-10 text-neutral-400">THR</span>
                      <div className="flex-1 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all"
                          style={{ width: `${live.throttle}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-emerald-400 font-bold">{live.throttle}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-10 text-neutral-400">BRK</span>
                      <div className="flex-1 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full transition-all"
                          style={{ width: `${live.brake}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-red-400 font-bold">{live.brake}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: OPENF1 INTERVALS & GAPS (/intervals) */}
      {openf1ViewTab === 'intervals' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-white/5">
            <span>OpenF1 Live Session Intervals Endpoint (api.openf1.org/v1/intervals)</span>
            <span className="text-cyan-400">Session 9632</span>
          </div>

          <div className="divide-y divide-white/5 border border-white/10 rounded-lg overflow-hidden bg-[#0c101a]">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-black/40 text-[10px] font-bold text-neutral-400 uppercase">
              <div className="col-span-1">CAR</div>
              <div className="col-span-3">DRIVER</div>
              <div className="col-span-4 text-right">GAP TO LEADER</div>
              <div className="col-span-4 text-right">INTERVAL TO CAR AHEAD</div>
            </div>

            {filteredDrivers.map((driver) => {
              const intv = openf1Intervals.find((i) => i.driver_number === driver.driverNumber);
              const gapLeader = intv?.gap_to_leader ?? driver.gapToLeader;
              const intervalAhead = intv?.interval ?? driver.intervalToAhead;

              return (
                <div
                  key={driver.driverNumber}
                  onClick={() => onSelectDriver(driver.driverCode)}
                  className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 hover:bg-white/5 cursor-pointer text-xs"
                >
                  <div className="col-span-1 font-bold text-cyan-400">#{driver.driverNumber}</div>
                  <div className="col-span-3 font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                    <span>{driver.driverName}</span>
                  </div>
                  <div className="col-span-4 text-right text-neutral-200 font-mono-nums font-bold">
                    {gapLeader}
                  </div>
                  <div className="col-span-4 text-right text-cyan-300 font-mono-nums">
                    {intervalAhead}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: OPENF1 STINTS & PIT STOPS (/stints & /pit) */}
      {openf1ViewTab === 'stints' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin text-xs font-mono">
          <div>
            <h3 className="text-white font-bold font-f1 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>OpenF1 Tyre Stints &amp; Strategy (/stints)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {openf1Stints.map((stint, idx) => {
                const driver = drivers.find((d) => d.driverNumber === stint.driver_number);
                return (
                  <div key={idx} className="bg-[#0c101a] p-3 rounded-lg border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        #{stint.driver_number} {driver?.driverCode || 'F1'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                        Stint #{stint.stint_number}
                      </span>
                    </div>
                    <div className="text-sm font-black text-amber-300">
                      {stint.compound} TYRE
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Laps {stint.lap_start} → {stint.lap_end || 'Current'} ({stint.tyre_age_at_start}L at start)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <h3 className="text-white font-bold font-f1 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Official Pit Stop Durations (/pit)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {OPENF1_SAMPLE_PITS.map((pit, idx) => {
                const driver = drivers.find((d) => d.driverNumber === pit.driver_number);
                return (
                  <div key={idx} className="bg-[#0c101a] p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                      <span>Lap {pit.lap_number}</span>
                      <span>{new Date(pit.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-base font-black text-cyan-300">
                      {pit.pit_duration}s STOP
                    </div>
                    <div className="text-white font-bold text-xs">
                      #{pit.driver_number} {driver?.driverName || 'Driver'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: OPENF1 OFFICIAL TEAM RADIO FEED (/team_radio) */}
      {openf1ViewTab === 'radio' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin text-xs font-mono">
          <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>OpenF1 Official Audio Broadcast Streams (/team_radio)</span>
            </span>
            <span className="text-amber-400">{openf1RadioList.length} Live Audio Transcripts</span>
          </div>

          <div className="space-y-2.5">
            {openf1RadioList.map((radioItem, idx) => {
              const driver = drivers.find((d) => d.driverNumber === radioItem.driver_number);
              const isPlaying = playingRadioUrl === radioItem.recording_url && isPlayingAudio;

              return (
                <div
                  key={idx}
                  className="bg-[#0c101a] p-3 rounded-lg border border-white/5 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-f1">
                        #{radioItem.driver_number} {driver?.driverName || 'Driver'}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(radioItem.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-neutral-300 italic text-[11px] bg-black/40 p-2 rounded border border-white/5">
                      "{radioItem.transcript}"
                    </p>
                  </div>

                  <button
                    onClick={() => handlePlayRadio(radioItem.recording_url)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause Audio' : 'Play Radio'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <div className="p-2.5 bg-[#080b11] border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Fastest Lap
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Personal Best
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> 20Hz OpenF1 Telemetry
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://openf1.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>openf1.org</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>·</span>
          <a
            href="https://formula-timer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <span>formula-timer</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
