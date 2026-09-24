import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StreamPlayer } from './components/StreamPlayer';
import { TimingTower } from './components/TimingTower';
import { TelemetryLab } from './components/TelemetryLab';
import { DriverTrackerMap } from './components/DriverTrackerMap';
import { RaceControlFeed } from './components/RaceControlFeed';
import { RaceWeekendHub } from './components/RaceWeekendHub';
import { HistoricalAnalysis } from './components/HistoricalAnalysis';
import { LiveTimingPortal } from './components/LiveTimingPortal';
import { OpenF1TelemetryHub } from './components/OpenF1TelemetryHub';
import { Channel4WebsiteView } from './components/Channel4WebsiteView';
import { VpnSystemModal, VPN_SERVERS } from './components/VpnSystemModal';
import {
  DriverTiming,
  FlagStatus,
  GrandPrixEvent,
  RaceAlert,
  RaceAlertConfig,
  RaceControlMessage,
  WeatherData,
  VpnServer,
  VpnState,
} from './types/f1';
import { INITIAL_DRIVERS } from './data/telemetryData';
import {
  INITIAL_RACE_MESSAGES,
  INITIAL_WEATHER,
  fetchLiveScoreboard,
  fetchOfficialJolpicaResults,
} from './services/f1Api';
import { soundEffects } from './services/soundEffects';
import { ExternalLink, Radio, Compass, History, Trophy, Sparkles, Tv, Activity, ShieldCheck, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'race-center' | 'tracker' | 'timing' | 'telemetry' | 'historical' | 'stream' | 'timing-portals' | 'openf1' | 'channel-4'
  >('race-center');
  const [drivers, setDrivers] = useState<DriverTiming[]>(INITIAL_DRIVERS);
  const [selectedDriverCode, setSelectedDriverCode] = useState<string>('NOR');
  const [comparedDriverCode, setComparedDriverCode] = useState<string>('VER');
  const [flagStatus, setFlagStatus] = useState<FlagStatus>('GREEN');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentLap, setCurrentLap] = useState<number>(18);
  const [totalLaps, setTotalLaps] = useState<number>(51);
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [raceMessages, setRaceMessages] = useState<RaceControlMessage[]>(INITIAL_RACE_MESSAGES);

  // Active Stream Channel (Defaults to Channel 4 or Sky Sports F1)
  const [selectedStreamChannel, setSelectedStreamChannel] = useState<
    'channel-4-uk' | 'sky-sports-f1-uk' | 'clean-feed' | 'f1-tv'
  >('channel-4-uk');

  // Active Live Timing & Telemetry Provider Source (OpenF1 by default)
  const [timingSource, setTimingSource] = useState<'openf1' | 'pitwall' | 'formula-timer' | 'f1pedia'>('openf1');

  // VPN System State (Defaults to connected to UK - London for immediate Channel 4 access)
  const [isVpnModalOpen, setIsVpnModalOpen] = useState<boolean>(false);
  const [vpnState, setVpnState] = useState<VpnState>({
    isConnected: true,
    isConnecting: false,
    currentServer: VPN_SERVERS[0], // UK - London #1
    bytesReceivedMb: 142.4,
    bytesSentMb: 18.2,
    killSwitchActive: true,
    dnsLeakProtection: true,
    protocol: 'WireGuard Turbo',
  });

  const handleToggleVpnConnect = () => {
    if (vpnState.isConnected) {
      setVpnState((prev) => ({ ...prev, isConnected: false }));
    } else {
      setVpnState((prev) => ({ ...prev, isConnecting: true }));
      setTimeout(() => {
        setVpnState((prev) => ({ ...prev, isConnected: true, isConnecting: false }));
      }, 700);
    }
  };

  const handleSelectVpnServer = (server: VpnServer) => {
    setVpnState((prev) => ({
      ...prev,
      currentServer: server,
      protocol: server.protocol,
    }));
  };

  const handleToggleKillSwitch = () => {
    setVpnState((prev) => ({ ...prev, killSwitchActive: !prev.killSwitchActive }));
  };

  const handleToggleDnsLeak = () => {
    setVpnState((prev) => ({ ...prev, dnsLeakProtection: !prev.dnsLeakProtection }));
  };

  // Customizable Race Alert System State
  const [alerts, setAlerts] = useState<RaceAlert[]>([
    {
      id: 'init-alert-1',
      timestamp: '12:04:12',
      lap: 18,
      type: 'FASTEST_LAP',
      title: 'Purple Sector Lap Set',
      message: 'Lando Norris (McLaren) sets fastest lap of the session: 1:43.184',
      driverCode: 'NOR',
      teamColor: '#FF8000',
    },
  ]);

  const [alertConfig, setAlertConfig] = useState<RaceAlertConfig>({
    overtake: true,
    pitStop: true,
    safetyCar: true,
    leaderChange: true,
    favoriteTop3: true,
    fastestLap: true,
    favoriteDriverCode: 'NOR',
    soundEnabled: true,
    browserNotifications: false,
  });

  const prevLeaderRef = useRef<string>('NOR');
  const prevPositionsRef = useRef<Record<string, number>>({});

  const [currentEvent, setCurrentEvent] = useState<GrandPrixEvent>({
    id: '600057444',
    name: 'Qatar Airways Azerbaijan Grand Prix',
    round: 17,
    season: '2026',
    circuitName: 'Baku City Circuit',
    country: 'Azerbaijan',
    date: '2026-09-24T08:30Z',
    sessionType: 'FP1',
    isLive: true,
    totalLaps: 51,
    currentLap: 18,
  });

  // Trigger alert helper function
  const triggerAlert = (
    type: RaceAlert['type'],
    title: string,
    message: string,
    driverCode?: string,
    teamColor?: string
  ) => {
    if (type === 'OVERTAKE' && !alertConfig.overtake) return;
    if (type === 'PIT_STOP' && !alertConfig.pitStop) return;
    if (type === 'SAFETY_CAR' && !alertConfig.safetyCar) return;
    if (type === 'LEADER_CHANGE' && !alertConfig.leaderChange) return;
    if (type === 'FAVORITE_TOP_3' && !alertConfig.favoriteTop3) return;
    if (type === 'FASTEST_LAP' && !alertConfig.fastestLap) return;

    if (alertConfig.soundEnabled) {
      if (type === 'SAFETY_CAR') {
        soundEffects.playWarningAlert();
      } else if (type === 'OVERTAKE' || type === 'LEADER_CHANGE' || type === 'FAVORITE_TOP_3') {
        soundEffects.playOvertakeChime();
      } else {
        soundEffects.playRadioChirp();
      }
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newAlert: RaceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      lap: currentLap,
      type,
      title,
      message,
      driverCode,
      teamColor: teamColor || '#e10600',
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 20)]);

    if (alertConfig.browserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`F1 PitWall Alert: ${title}`, {
          body: message,
          icon: '/favicon.ico',
        });
      }
    }
  };

  // Manual test trigger for testing customization
  const handleTriggerTestAlert = (type: RaceAlert['type']) => {
    const favDriver = drivers.find((d) => d.driverCode === alertConfig.favoriteDriverCode) || drivers[0];
    switch (type) {
      case 'OVERTAKE':
        triggerAlert(
          'OVERTAKE',
          `Overtake: ${favDriver.driverCode} gains position!`,
          `${favDriver.driverName} makes a late braking pass into Turn 1 Neftchilar straight.`,
          favDriver.driverCode,
          favDriver.teamColor
        );
        break;
      case 'PIT_STOP':
        triggerAlert(
          'PIT_STOP',
          `Box Box: ${favDriver.teamName} In Pits`,
          `${favDriver.driverName} enters pit lane (Stop 1, 2.3s stationary, fitted HARD tyres).`,
          favDriver.driverCode,
          favDriver.teamColor
        );
        break;
      case 'SAFETY_CAR':
        setFlagStatus('SC');
        triggerAlert(
          'SAFETY_CAR',
          'SAFETY CAR DEPLOYED',
          'Race neutralized due to debris at Castle Section (Turn 8). Delta time active.',
          undefined,
          '#f59e0b'
        );
        break;
      case 'LEADER_CHANGE':
        triggerAlert(
          'LEADER_CHANGE',
          `NEW RACE LEADER: P1 ${favDriver.driverCode}`,
          `${favDriver.driverName} takes P1 on Lap ${currentLap}!`,
          favDriver.driverCode,
          favDriver.teamColor
        );
        break;
      case 'FAVORITE_TOP_3':
        triggerAlert(
          'FAVORITE_TOP_3',
          `Target Driver Podium Alert: ${favDriver.driverCode}`,
          `Your selected favorite driver ${favDriver.driverName} is running in P${Math.min(3, favDriver.position)}!`,
          favDriver.driverCode,
          favDriver.teamColor
        );
        break;
      case 'FASTEST_LAP':
        triggerAlert(
          'FASTEST_LAP',
          `FASTEST LAP: ${favDriver.driverCode}`,
          `${favDriver.driverName} clocks 1:42.940 (Purple in Sectors 1 & 3).`,
          favDriver.driverCode,
          favDriver.teamColor
        );
        break;
    }
  };

  // Fetch real F1 API data
  const loadF1ApiData = async () => {
    setIsRefreshing(true);
    try {
      const sb = await fetchLiveScoreboard();
      if (sb.event) {
        setCurrentEvent(sb.event);
        if (sb.event.currentLap) setCurrentLap(sb.event.currentLap);
      }

      const jolpicaResults = await fetchOfficialJolpicaResults();
      if (jolpicaResults && jolpicaResults.length > 0) {
        setDrivers((prev) =>
          prev.map((d) => {
            const match = jolpicaResults.find(
              (jr) => jr.driverCode === d.driverCode || jr.position === d.position
            );
            if (match && match.bestLapTime) {
              return {
                ...d,
                bestLapTime: match.bestLapTime,
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.warn('F1 API sync note:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadF1ApiData();
  }, []);

  useEffect(() => {
    drivers.forEach((d) => {
      prevPositionsRef.current[d.driverCode] = d.position;
    });
    if (drivers[0]) prevLeaderRef.current = drivers[0].driverCode;
  }, []);

  // Real-time Telemetry Animation & Dynamic Alert Trigger Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setDrivers((prev) => {
        const updated = prev.map((driver) => {
          const progressDelta = 0.007 + (20 - driver.position) * 0.0003;
          let newProgress = (driver.lapDistanceProgress + progressDelta) % 1;

          let speed = 260;
          let gear = 6;
          let throttle = 95;
          let brake = 0;
          let drs = false;

          if (newProgress < 0.20) {
            speed = Math.min(352, 280 + newProgress * 360);
            gear = 8;
            throttle = 100;
            drs = true;
          } else if (newProgress >= 0.20 && newProgress < 0.28) {
            speed = 95 + Math.sin(Date.now() / 200) * 10;
            gear = 3;
            throttle = 15;
            brake = 85;
          } else if (newProgress >= 0.44 && newProgress < 0.58) {
            speed = 88 + Math.cos(Date.now() / 300) * 8;
            gear = 2;
            throttle = 40;
            brake = 20;
          } else {
            speed = 315 + Math.sin(newProgress * 10) * 25;
            gear = 7;
            throttle = 90;
            drs = newProgress > 0.75;
          }

          const rpm = Math.round(speed > 300 ? 11800 + Math.random() * 300 : 8800 + (speed % 40) * 60);

          return {
            ...driver,
            lapDistanceProgress: newProgress,
            currentSpeed: Math.round(speed),
            currentGear: gear,
            currentThrottle: throttle,
            currentBrake: brake,
            currentRpm: rpm,
            drsActive: drs,
          };
        });

        // Check for Leader Change alert trigger
        if (updated[0] && updated[0].driverCode !== prevLeaderRef.current) {
          triggerAlert(
            'LEADER_CHANGE',
            `NEW RACE LEADER: P1 ${updated[0].driverCode}`,
            `${updated[0].driverName} takes the lead into Turn 1!`,
            updated[0].driverCode,
            updated[0].teamColor
          );
          prevLeaderRef.current = updated[0].driverCode;
        }

        // Check for Favorite Driver Top 3 alert trigger
        const fav = updated.find((d) => d.driverCode === alertConfig.favoriteDriverCode);
        const prevFavPos = prevPositionsRef.current[alertConfig.favoriteDriverCode];
        if (fav && fav.position <= 3 && prevFavPos && prevFavPos > 3) {
          triggerAlert(
            'FAVORITE_TOP_3',
            `Podium Position Alert: ${fav.driverCode}`,
            `Favorite driver ${fav.driverName} breaks into the top 3 (currently P${fav.position})!`,
            fav.driverCode,
            fav.teamColor
          );
        }

        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulating, alertConfig, currentLap]);

  const currentLeader = drivers[0];

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#f1f3f9] flex flex-col font-sans selection:bg-[#e10600] selection:text-white">
      {/* Top Bar Header with Navigation, VPN indicator & RaceAlertSystem */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        flagStatus={flagStatus}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onRefresh={loadF1ApiData}
        isRefreshing={isRefreshing}
        selectedSession={currentEvent.sessionType}
        alerts={alerts}
        onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
        onClearAllAlerts={() => setAlerts([])}
        alertConfig={alertConfig}
        onUpdateAlertConfig={setAlertConfig}
        drivers={drivers}
        onTriggerTestAlert={handleTriggerTestAlert}
        selectedStreamChannel={selectedStreamChannel}
        onSelectStreamChannel={(ch) => setSelectedStreamChannel(ch)}
        timingSource={timingSource}
        onSelectTimingSource={(src) => {
          setTimingSource(src);
          if (src === 'pitwall') {
            setActiveTab('timing');
          } else {
            setActiveTab('timing-portals');
          }
        }}
        vpnState={vpnState}
        onOpenVpnModal={() => setIsVpnModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Race Weekend Notification & Broadcast Channel Quick Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#11141c] border border-white/5 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white font-mono uppercase">
              {currentEvent.name} · {currentEvent.sessionType} LIVE
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400 hidden sm:inline">
              Stream:{' '}
              {selectedStreamChannel === 'channel-4-uk' ? (
                <strong className="text-[#00E5FF]">Channel 4 [UK] (C4 F1)</strong>
              ) : (
                <strong className="text-sky-400">Sky Sports F1 [UK]</strong>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {/* Launch Channel 4 UK F1 Website & Player Directly */}
            <button
              onClick={() => {
                setSelectedStreamChannel('channel-4-uk');
                setActiveTab('channel-4');
              }}
              className={`px-3 py-1 rounded text-xs font-black font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'channel-4' || (selectedStreamChannel === 'channel-4-uk' && activeTab === 'stream')
                  ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/40'
                  : 'bg-[#00E5FF]/15 text-[#00E5FF] hover:bg-[#00E5FF]/25 border border-[#00E5FF]/30'
              }`}
              title="Launch Official Channel 4 F1 Website & Player directly in Website"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Channel 4 UK F1 Website</span>
            </button>

            {/* Direct Official Link to Channel 4 F1 */}
            <a
              href="https://www.channel4.com/programmes/formula-1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded text-xs font-bold font-mono text-neutral-400 hover:text-white hover:bg-white/5 flex items-center gap-1 whitespace-nowrap"
              title="Open Official Channel 4 Formula 1 Website (https://www.channel4.com/programmes/formula-1)"
            >
              <span>channel4.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            {/* OpenF1 Hub Quick Switch */}
            <button
              onClick={() => setActiveTab('openf1')}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'openf1'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white/5 text-neutral-300 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>OpenF1 Live</span>
            </button>

            {/* Quick Switch to Sky F1 */}
            <button
              onClick={() => {
                setSelectedStreamChannel('sky-sports-f1-uk');
                setActiveTab('stream');
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedStreamChannel === 'sky-sports-f1-uk' && activeTab === 'stream'
                  ? 'bg-[#e10600] text-white'
                  : 'bg-white/5 text-neutral-300 hover:text-white'
              }`}
            >
              <span>Sky F1</span>
            </button>

            <span className="text-neutral-600">|</span>

            {/* VPN Quick Access Button */}
            <button
              onClick={() => setIsVpnModalOpen(true)}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                vpnState.isConnected && vpnState.currentServer.isUk
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : vpnState.isConnected
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25'
                  : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
              }`}
              title="Apex PitWall VPN Tunnel Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {vpnState.isConnected
                  ? `VPN: ${vpnState.currentServer.flag} ${vpnState.currentServer.city}`
                  : 'VPN: OFF'}
              </span>
            </button>

            <span className="text-neutral-600">|</span>

            {/* FORMULA-TIMER.COM QUICK LAUNCH BUTTON */}
            <button
              onClick={() => {
                setTimingSource('formula-timer');
                setActiveTab('timing-portals');
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'timing-portals' && timingSource === 'formula-timer'
                  ? 'bg-[#e10600] text-white shadow-sm'
                  : 'bg-white/5 text-red-400 hover:bg-white/10'
              }`}
            >
              <span>⏱️</span>
              <span>Formula-Timer</span>
            </button>

            {/* F1PEDIA.COM QUICK LAUNCH BUTTON */}
            <button
              onClick={() => {
                setTimingSource('f1pedia');
                setActiveTab('timing-portals');
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'timing-portals' && timingSource === 'f1pedia'
                  ? 'bg-sky-500 text-black shadow-sm'
                  : 'bg-white/5 text-sky-400 hover:bg-white/10'
              }`}
            >
              <span>🏎️</span>
              <span>F1Pedia</span>
            </button>

            <span className="text-neutral-600">|</span>

            <button
              onClick={() => setActiveTab('tracker')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Track 20 Drivers</span>
            </button>
          </div>
        </div>

        {/* TAB 1: RACE CENTER (SPLIT VIEW) */}
        {activeTab === 'race-center' && (
          <div className="space-y-6">
            {/* Top Split: Live Stream Player (Channel 4 / Sky Sports F1 UK) + Timing Tower */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                <StreamPlayer
                  currentLeader={currentLeader}
                  flagStatus={flagStatus}
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                  onToggleTheater={() => setActiveTab('stream')}
                  initialChannel={selectedStreamChannel}
                  vpnState={vpnState}
                  onOpenVpnModal={() => setIsVpnModalOpen(true)}
                />
              </div>

              <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-h-[460px]">
                <TimingTower
                  drivers={drivers}
                  selectedDriverCode={selectedDriverCode}
                  onSelectDriver={(code) => setSelectedDriverCode(code)}
                  comparedDriverCode={comparedDriverCode}
                  onSelectCompareDriver={(code) => setComparedDriverCode(code)}
                  compact={true}
                  currentTimingSource={timingSource}
                  onSelectTimingSource={(src) => {
                    setTimingSource(src);
                    if (src === 'formula-timer' || src === 'f1pedia') setActiveTab('timing-portals');
                  }}
                  onLaunchChannel4={() => {
                    setSelectedStreamChannel('channel-4-uk');
                    setActiveTab('channel-4');
                  }}
                  onOpenOpenF1Hub={() => setActiveTab('openf1')}
                />
              </div>
            </div>

            {/* Middle Section: Real-Time 2D Driver Tracking Map */}
            <div className="w-full">
              <DriverTrackerMap
                drivers={drivers}
                selectedDriverCode={selectedDriverCode}
                onSelectDriver={(code) => setSelectedDriverCode(code)}
                airTemp={weather.airTemp}
                trackTemp={weather.trackTemp}
                windSpeed={weather.windSpeed}
                isSimulating={isSimulating}
              />
            </div>

            {/* Bottom Split: Telemetry Lab & Race Control Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col">
                <TelemetryLab
                  drivers={drivers}
                  primaryDriverCode={selectedDriverCode}
                  onSelectPrimaryDriver={(code) => setSelectedDriverCode(code)}
                  secondaryDriverCode={comparedDriverCode}
                  onSelectSecondaryDriver={(code) => setComparedDriverCode(code)}
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <RaceControlFeed messages={raceMessages} />
                <RaceWeekendHub
                  currentEvent={currentEvent}
                  onOpenStream={() => setActiveTab('stream')}
                  onOpenChannel4={() => {
                    setSelectedStreamChannel('channel-4-uk');
                    setActiveTab('channel-4');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME DRIVER TRACKING (2D MAP FOCUS) */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <DriverTrackerMap
              drivers={drivers}
              selectedDriverCode={selectedDriverCode}
              onSelectDriver={(code) => setSelectedDriverCode(code)}
              airTemp={weather.airTemp}
              trackTemp={weather.trackTemp}
              windSpeed={weather.windSpeed}
              isSimulating={isSimulating}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TimingTower
                  drivers={drivers}
                  selectedDriverCode={selectedDriverCode}
                  onSelectDriver={(code) => setSelectedDriverCode(code)}
                  compact={false}
                  currentTimingSource={timingSource}
                  onSelectTimingSource={(src) => {
                    setTimingSource(src);
                    if (src !== 'pitwall') setActiveTab('timing-portals');
                  }}
                />
              </div>
              <div className="lg:col-span-5">
                <RaceControlFeed messages={raceMessages} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEDICATED STREAM PLAYER (THEATER VIEW - CHANNEL 4 / SKY F1) */}
        {activeTab === 'stream' && (
          <div className="space-y-6">
            <div className="h-[75vh] min-h-[500px]">
              <StreamPlayer
                currentLeader={currentLeader}
                flagStatus={flagStatus}
                currentLap={currentLap}
                totalLaps={totalLaps}
                theaterMode={true}
                initialChannel={selectedStreamChannel}
                vpnState={vpnState}
                onOpenVpnModal={() => setIsVpnModalOpen(true)}
              />
            </div>

            <TimingTower
              drivers={drivers}
              selectedDriverCode={selectedDriverCode}
              onSelectDriver={(code) => setSelectedDriverCode(code)}
              compact={false}
              currentTimingSource={timingSource}
              onSelectTimingSource={(src) => {
                setTimingSource(src);
                if (src !== 'pitwall') setActiveTab('timing-portals');
              }}
            />
          </div>
        )}

        {/* TAB 4: OFFICIAL OPENF1 TIMING TOWER */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <TimingTower
              drivers={drivers}
              selectedDriverCode={selectedDriverCode}
              onSelectDriver={(code) => setSelectedDriverCode(code)}
              comparedDriverCode={comparedDriverCode}
              onSelectCompareDriver={(code) => setComparedDriverCode(code)}
              compact={false}
              currentTimingSource={timingSource}
              onSelectTimingSource={(src) => {
                setTimingSource(src);
                if (src === 'formula-timer' || src === 'f1pedia') setActiveTab('timing-portals');
              }}
              onLaunchChannel4={() => {
                setSelectedStreamChannel('channel-4-uk');
                setActiveTab('channel-4');
              }}
              onOpenOpenF1Hub={() => setActiveTab('openf1')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RaceControlFeed messages={raceMessages} />
              <RaceWeekendHub
                currentEvent={currentEvent}
                onOpenStream={() => setActiveTab('stream')}
                onOpenChannel4={() => {
                  setSelectedStreamChannel('channel-4-uk');
                  setActiveTab('channel-4');
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: LIVE TIMING & TELEMETRY EXTERNAL PORTALS (FORMULA-TIMER.COM & F1PEDIA.COM) */}
        {activeTab === 'timing-portals' && (
          <div className="space-y-6">
            <LiveTimingPortal
              source={timingSource === 'pitwall' || timingSource === 'openf1' ? 'formula-timer' : timingSource}
              onSelectSource={(src) => {
                if (src === 'pitwall' || src === 'openf1') {
                  setTimingSource(src);
                  setActiveTab('timing');
                } else {
                  setTimingSource(src);
                }
              }}
              currentLeader={currentLeader}
              currentLap={currentLap}
              totalLaps={totalLaps}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TimingTower
                  drivers={drivers}
                  selectedDriverCode={selectedDriverCode}
                  onSelectDriver={(code) => setSelectedDriverCode(code)}
                  compact={false}
                  currentTimingSource={timingSource}
                  onSelectTimingSource={(src) => {
                    setTimingSource(src);
                    if (src === 'pitwall' || src === 'openf1') setActiveTab('timing');
                  }}
                  onLaunchChannel4={() => {
                    setSelectedStreamChannel('channel-4-uk');
                    setActiveTab('channel-4');
                  }}
                  onOpenOpenF1Hub={() => setActiveTab('openf1')}
                />
              </div>
              <div className="lg:col-span-5">
                <RaceControlFeed messages={raceMessages} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TELEMETRY LAB */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <TelemetryLab
              drivers={drivers}
              primaryDriverCode={selectedDriverCode}
              onSelectPrimaryDriver={(code) => setSelectedDriverCode(code)}
              secondaryDriverCode={comparedDriverCode}
              onSelectSecondaryDriver={(code) => setComparedDriverCode(code)}
              currentLap={currentLap}
              totalLaps={totalLaps}
              onLaunchChannel4={() => {
                setSelectedStreamChannel('channel-4-uk');
                setActiveTab('channel-4');
              }}
              onOpenOpenF1={() => setActiveTab('openf1')}
            />

            <DriverTrackerMap
              drivers={drivers}
              selectedDriverCode={selectedDriverCode}
              onSelectDriver={(code) => setSelectedDriverCode(code)}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* TAB 7: HISTORICAL DATA ANALYSIS MODULE */}
        {activeTab === 'historical' && (
          <div className="space-y-6">
            <HistoricalAnalysis onWatchStreamReplay={() => setActiveTab('stream')} />
          </div>
        )}

        {/* TAB 8: OPENF1 REAL-TIME TELEMETRY & CHANNEL 4 LAUNCH HUB */}
        {activeTab === 'openf1' && (
          <div className="space-y-6">
            <OpenF1TelemetryHub
              onLaunchChannel4={() => {
                setSelectedStreamChannel('channel-4-uk');
                setActiveTab('channel-4');
              }}
              activeDriverCode={selectedDriverCode}
              drivers={drivers}
            />
          </div>
        )}

        {/* TAB 9: CHANNEL 4 UK FORMULA 1 OFFICIAL WEBSITE EXPERIENCE */}
        {activeTab === 'channel-4' && (
          <div className="space-y-6">
            <Channel4WebsiteView
              currentLeader={currentLeader}
              flagStatus={flagStatus}
              currentLap={currentLap}
              totalLaps={totalLaps}
              vpnState={vpnState}
              onOpenVpnModal={() => setIsVpnModalOpen(true)}
              onSwitchToOpenF1={() => setActiveTab('openf1')}
              onSwitchToSkyF1={() => {
                setSelectedStreamChannel('sky-sports-f1-uk');
                setActiveTab('stream');
              }}
            />
          </div>
        )}
      </main>

      {/* VPN System Modal */}
      <VpnSystemModal
        isOpen={isVpnModalOpen}
        onClose={() => setIsVpnModalOpen(false)}
        vpnState={vpnState}
        onToggleConnect={handleToggleVpnConnect}
        onSelectServer={handleSelectVpnServer}
        onToggleKillSwitch={handleToggleKillSwitch}
        onToggleDnsLeak={handleToggleDnsLeak}
      />

      {/* Footer */}
      <footer className="w-full bg-[#07080b] border-t border-white/5 py-4 px-6 text-xs text-neutral-500 font-mono-nums">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-300">Apex PitWall</span>
            <span>·</span>
            <span>Formula 1 Official Live Telemetry &amp; Timing</span>
            <span>·</span>
            <span>Baku City Circuit</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
            <a
              href="https://www.channel4.com/programmes/formula-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00E5FF] hover:underline flex items-center gap-1 font-bold font-mono"
            >
              <span>channel4.com/programmes/formula-1</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>·</span>
            <a
              href="https://formula-timer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline flex items-center gap-1"
            >
              <span>formula-timer.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>·</span>
            <a
              href="https://f1pedia.com/en/live-timing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>f1pedia.com/en/live-timing</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>·</span>
            <button
              onClick={() => setIsVpnModalOpen(true)}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>VPN Tunnel: {vpnState.isConnected ? vpnState.currentServer.city : 'Disconnected'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
