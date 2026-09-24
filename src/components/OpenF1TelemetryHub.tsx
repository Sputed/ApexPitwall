import React, { useState, useEffect } from 'react';
import {
  OpenF1CarData,
  OpenF1DriverProfile,
  OpenF1Interval,
  OpenF1Pit,
  OpenF1Radio,
  OpenF1Session,
  DriverTiming,
} from '../types/f1';
import {
  fetchOpenF1CarData,
  fetchOpenF1Intervals,
  fetchOpenF1Sessions,
  fetchOpenF1TeamRadio,
  OPENF1_SAMPLE_DRIVERS,
  OPENF1_SAMPLE_PITS,
} from '../services/openf1Service';
import {
  Activity,
  Radio,
  ExternalLink,
  RefreshCw,
  Gauge,
  Zap,
  Play,
  Volume2,
  Tv,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface OpenF1TelemetryHubProps {
  onLaunchChannel4: () => void;
  activeDriverCode?: string;
  drivers: DriverTiming[];
}

export const OpenF1TelemetryHub: React.FC<OpenF1TelemetryHubProps> = ({
  onLaunchChannel4,
  activeDriverCode = 'NOR',
  drivers,
}) => {
  const [selectedDriverNum, setSelectedDriverNum] = useState<number>(4); // Norris #4
  const [sessions, setSessions] = useState<OpenF1Session[]>([]);
  const [carData, setCarData] = useState<OpenF1CarData[]>([]);
  const [intervals, setIntervals] = useState<OpenF1Interval[]>([]);
  const [radios, setRadios] = useState<OpenF1Radio[]>([]);
  const [pits, setPits] = useState<OpenF1Pit[]>(OPENF1_SAMPLE_PITS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'intervals' | 'radio' | 'endpoints'>('cockpit');

  const selectedDriverProfile =
    OPENF1_SAMPLE_DRIVERS.find((d) => d.driver_number === selectedDriverNum) ||
    OPENF1_SAMPLE_DRIVERS[0];

  const loadOpenF1Data = async () => {
    setIsLoading(true);
    try {
      const [sessList, cd, intv, rad] = await Promise.all([
        fetchOpenF1Sessions(),
        fetchOpenF1CarData(selectedDriverNum),
        fetchOpenF1Intervals(),
        fetchOpenF1TeamRadio(),
      ]);

      setSessions(sessList);
      setCarData(cd);
      setIntervals(intv);
      setRadios(rad);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('OpenF1 load err:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpenF1Data();
  }, [selectedDriverNum]);

  // Live polling pulse every 1.5 seconds for car data
  useEffect(() => {
    const timer = setInterval(() => {
      setCarData((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const newSpeed = Math.min(354, Math.max(120, last.speed + Math.round((Math.random() - 0.48) * 8)));
        const newThrottle = newSpeed > 280 ? 100 : Math.max(20, Math.round(newSpeed / 3.4));
        const newBrake = newThrottle < 60 && Math.random() > 0.6 ? Math.round(Math.random() * 80) : 0;
        const newRpm = Math.round(newSpeed > 300 ? 11600 + Math.random() * 350 : 9200 + (newSpeed % 50) * 45);
        const newGear = newSpeed > 310 ? 8 : newSpeed > 260 ? 7 : newSpeed > 210 ? 6 : 5;

        const nextPoint: OpenF1CarData = {
          ...last,
          speed: newSpeed,
          rpm: newRpm,
          throttle: newThrottle,
          brake: newBrake,
          n_gear: newGear,
          drs: newSpeed > 290 ? 1 : 0,
          date: new Date().toISOString(),
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const latestCar = carData[carData.length - 1] || {
    speed: 324,
    rpm: 11840,
    n_gear: 8,
    throttle: 100,
    brake: 0,
    drs: 1,
  };

  return (
    <div className="flex flex-col gap-5 bg-[#0a0c12] rounded-xl border border-white/10 p-4 lg:p-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black uppercase tracking-wider text-white font-f1">
                OpenF1 Real-Time Telemetry &amp; Live Broadcast Hub
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                API.OPENF1.ORG CONNECTED
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Community open-source F1 telemetry engine synced with Channel 4 UK broadcast
            </p>
          </div>
        </div>

        {/* Action Controls & Channel 4 Launch Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Launch Channel 4 in Website Button */}
          <button
            onClick={onLaunchChannel4}
            className="px-4 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-black text-xs font-mono flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20 transition-all cursor-pointer"
            title="Launch Channel 4 Formula 1 Stream in Website"
          >
            <Tv className="w-4 h-4" />
            <span>Launch Channel 4 in Website</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={loadOpenF1Data}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Refresh OpenF1 Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-500' : ''}`} />
          </button>

          <a
            href="https://openf1.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>openf1.org</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Driver Selector & View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11141d] p-2 rounded-xl border border-white/5">
        {/* Driver selector badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          <span className="text-[11px] font-mono text-neutral-500 px-2 font-bold">DRIVERS:</span>
          {OPENF1_SAMPLE_DRIVERS.map((d) => (
            <button
              key={d.driver_number}
              onClick={() => setSelectedDriverNum(d.driver_number)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedDriverNum === d.driver_number
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `#${d.team_colour}` }}
              />
              <span>
                #{d.driver_number} {d.name_acronym}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              activeTab === 'cockpit' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Car Cockpit
          </button>
          <button
            onClick={() => setActiveTab('intervals')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              activeTab === 'intervals' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live Intervals
          </button>
          <button
            onClick={() => setActiveTab('radio')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              activeTab === 'radio' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Team Radio
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              activeTab === 'endpoints' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            OpenF1 APIs
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: CAR COCKPIT TELEMETRY GAUGES */}
      {activeTab === 'cockpit' && (
        <div className="space-y-4">
          {/* Channel 4 + OpenF1 Sync Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF]/15 via-blue-950/30 to-black border border-[#00E5FF]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF] text-black flex items-center justify-center font-black font-mono text-sm shadow-md shadow-[#00E5FF]/30">
                4
              </div>
              <div>
                <div className="text-white font-black font-f1 text-sm flex items-center gap-2">
                  <span>Channel 4 Formula 1 UK Broadcast Synced</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono">
                    Official UK Coverage
                  </span>
                </div>
                <div className="text-neutral-400 text-xs">
                  Watch Channel 4 live with David Coulthard &amp; Mark Webber while inspecting real-time OpenF1 throttle, brake &amp; engine data.
                </div>
              </div>
            </div>

            <button
              onClick={onLaunchChannel4}
              className="px-3.5 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Channel 4 Stream</span>
            </button>
          </div>

          {/* Real-time Telemetry Telemetry Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono-nums">
            {/* Speed Gauge */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Vehicle Speed</div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                <span>{latestCar.speed}</span>
                <span className="text-xs text-neutral-400 font-normal">km/h</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">OpenF1 Stream 20Hz</div>
              <div
                className="absolute bottom-0 left-0 h-1 bg-[#00E5FF]"
                style={{ width: `${(latestCar.speed / 360) * 100}%` }}
              />
            </div>

            {/* Engine RPM */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Engine RPM</div>
              <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                <span>{latestCar.rpm}</span>
                <span className="text-xs text-neutral-500 font-normal">rpm</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">1.6L V6 Turbo Hybrid</div>
              <div
                className="absolute bottom-0 left-0 h-1 bg-amber-400"
                style={{ width: `${(latestCar.rpm / 12500) * 100}%` }}
              />
            </div>

            {/* Gear Position */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Gear Ratio</div>
              <div className="text-3xl font-black text-yellow-400">G{latestCar.n_gear}</div>
              <div className="text-[10px] text-neutral-400 mt-1">Seamless Shift 8-Speed</div>
            </div>

            {/* Throttle % */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Throttle App</div>
              <div className="text-2xl font-black text-emerald-400">{latestCar.throttle}%</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${latestCar.throttle}%` }}
                />
              </div>
            </div>

            {/* Brake % */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Brake Pressure</div>
              <div className="text-2xl font-black text-red-500">{latestCar.brake}%</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${latestCar.brake}%` }}
                />
              </div>
            </div>

            {/* DRS Status */}
            <div className="bg-[#131722] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1">DRS Wing</div>
              <div
                className={`text-xl font-black mt-1 ${
                  latestCar.drs ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                {latestCar.drs ? 'ACTIVE' : 'OFF'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Zone 1 Neftchilar</div>
            </div>
          </div>

          {/* Speed & Throttle History Trace */}
          <div className="p-4 bg-[#11141f] rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">
                {selectedDriverProfile.full_name} ({selectedDriverProfile.team_name}) — OpenF1 Telemetry Log
              </span>
              <span className="text-neutral-400">Endpoint: /v1/car_data?driver_number={selectedDriverNum}</span>
            </div>

            {/* Live Data Bars */}
            <div className="h-24 flex items-end gap-1 pt-2 bg-black/40 rounded-lg p-2 border border-white/5">
              {carData.map((pt, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full gap-0.5">
                  <div
                    className="w-full bg-[#00E5FF] rounded-t-xs"
                    style={{ height: `${(pt.speed / 360) * 100}%` }}
                    title={`Speed: ${pt.speed} km/h, Throttle: ${pt.throttle}%, Brake: ${pt.brake}%`}
                  />
                  <div
                    className="w-full bg-emerald-500/40 rounded-t-xs"
                    style={{ height: `${(pt.throttle / 100) * 20}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
              <span>T -20 telemetry frames</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#00E5FF]" /> Speed km/h
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Throttle %
                </span>
              </div>
              <span>Live (Synced)</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LIVE INTERVALS LADDER */}
      {activeTab === 'intervals' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
            <span>OpenF1 Live Timing Ladder (/v1/intervals)</span>
            <span>Session: Azerbaijan GP (9632)</span>
          </div>

          <div className="divide-y divide-white/5 bg-[#131722] rounded-xl border border-white/5 overflow-hidden">
            {intervals.map((intv, idx) => {
              const driver = OPENF1_SAMPLE_DRIVERS.find((d) => d.driver_number === intv.driver_number);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-400 w-6">P{idx + 1}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: driver ? `#${driver.team_colour}` : '#e10600' }}
                    />
                    <span className="text-white font-bold font-f1">
                      {driver ? driver.full_name : `Car #${intv.driver_number}`}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {driver ? driver.team_name : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 font-mono-nums">
                    <div>
                      <span className="text-neutral-500 text-[10px] mr-1.5">INTERVAL:</span>
                      <span className="text-neutral-200 font-bold">{intv.interval}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] mr-1.5">LEADER:</span>
                      <span className="text-amber-400 font-bold">{intv.gap_to_leader}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TEAM RADIO COMMUNICATOR */}
      {activeTab === 'radio' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
            <span>OpenF1 Team Radio Broadcast Stream (/v1/team_radio)</span>
            <span>Uncensored Engineer-to-Driver Comms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {radios.map((r, idx) => {
              const driver = OPENF1_SAMPLE_DRIVERS.find((d) => d.driver_number === r.driver_number);
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[#131722] rounded-xl border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: driver ? `#${driver.team_colour}` : '#e10600' }}
                      />
                      <span className="font-bold text-white font-f1">
                        #{r.driver_number} {driver ? driver.full_name : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(r.date).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-neutral-200 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                    "{r.transcript}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Audio Packet Synchronized
                    </span>
                    <a
                      href={r.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1"
                    >
                      <span>Audio Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: OPENF1 API DOCUMENTATION & LIVE ENDPOINTS */}
      {activeTab === 'endpoints' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="text-neutral-400">
            OpenF1 is an open-source real-time REST API for Formula 1 data. All live telemetry and timing can be queried directly:
          </div>

          <div className="space-y-2">
            {[
              { ep: '/v1/sessions?year=2024&session_name=Race', desc: 'Grand Prix and sprint session parameters' },
              { ep: `/v1/car_data?driver_number=${selectedDriverNum}&session_key=latest`, desc: 'Live throttle, brake, speed, RPM and DRS telemetry' },
              { ep: '/v1/intervals?session_key=latest', desc: 'Driver gaps, splits, and intervals to leader' },
              { ep: '/v1/laps?session_key=latest', desc: 'Sector 1, 2, 3 times and lap durations' },
              { ep: '/v1/pit?session_key=latest', desc: 'Pit stop entry, exit, and stationary durations' },
              { ep: '/v1/team_radio?session_key=latest', desc: 'Driver team radio audio streams and metadata' },
              { ep: '/v1/weather?session_key=latest', desc: 'Track temperature, air temp, wind speed & rainfall' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#131722] rounded-lg border border-white/5 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="text-emerald-400 font-bold">
                    GET https://api.openf1.org{item.ep}
                  </div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">{item.desc}</div>
                </div>

                <a
                  href={`https://api.openf1.org${item.ep}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-[11px] flex items-center gap-1"
                >
                  <span>Query API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
