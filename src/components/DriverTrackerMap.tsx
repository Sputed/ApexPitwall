import React, { useState, useMemo } from 'react';
import { CIRCUITS } from '../data/circuits';
import { DriverTiming, TrackCircuit } from '../types/f1';
import {
  Compass,
  Wind,
  Thermometer,
  Droplets,
  Trophy,
  Gauge,
  Zap,
  Target,
  Layers,
  Eye,
  Activity,
} from 'lucide-react';

interface DriverTrackerMapProps {
  drivers: DriverTiming[];
  selectedDriverCode: string;
  onSelectDriver: (code: string) => void;
  airTemp?: number;
  trackTemp?: number;
  windSpeed?: number;
  isSimulating?: boolean;
}

export const DriverTrackerMap: React.FC<DriverTrackerMapProps> = ({
  drivers,
  selectedDriverCode,
  onSelectDriver,
  airTemp = 26.8,
  trackTemp = 39.4,
  windSpeed = 11.2,
  isSimulating = true,
}) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('baku');
  const [displayFilter, setDisplayFilter] = useState<'ALL' | 'TOP_5' | 'SELECTED_ONLY'>('ALL');
  const [viewPreset, setViewPreset] = useState<'FULL' | 'CASTLE' | 'STRAIGHT'>('FULL');

  const circuit = CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[0];

  const leader = drivers.find((d) => d.position === 1) || drivers[0];
  const selectedDriver = drivers.find((d) => d.driverCode === selectedDriverCode) || drivers[0];

  // Helper function to calculate precise (x, y) coordinates along the circuit path for any progress 0 to 1
  const getCoordinatesForProgress = (progress: number, circuitId: string) => {
    const p = Math.max(0, Math.min(1, progress));

    if (circuitId === 'baku') {
      // Baku 2D Track Spline Profile
      // 0.00 - 0.20: Neftchilar Ave Main Straight (180,480) -> (780,480)
      // 0.20 - 0.32: T1 & T2 complex (780,480) -> (900,440) -> (890,340)
      // 0.32 - 0.44: Run to T3 & Old City entry (890,340) -> (790,210) -> (620,70)
      // 0.44 - 0.60: Narrow Castle Section T8-T12 (620,70) -> (530,220) -> (440,250) -> (390,160)
      // 0.60 - 0.76: T13-T16 downhill descent (390,160) -> (200,110) -> (160,250)
      // 0.76 - 1.00: T16 exit and full throttle 2.2km blast (160,250) -> (180,330) -> (210,430) -> (180,480)
      if (p <= 0.20) {
        const seg = p / 0.20;
        return { x: 180 + seg * 600, y: 480 };
      } else if (p <= 0.32) {
        const seg = (p - 0.20) / 0.12;
        return {
          x: 780 + Math.sin(seg * Math.PI) * 120 + seg * 110,
          y: 480 - seg * 140,
        };
      } else if (p <= 0.44) {
        const seg = (p - 0.32) / 0.12;
        return {
          x: 890 - seg * 270,
          y: 340 - seg * 270,
        };
      } else if (p <= 0.60) {
        const seg = (p - 0.44) / 0.16;
        return {
          x: 620 - seg * 230 + Math.sin(seg * Math.PI * 2) * 25,
          y: 70 + seg * 90 + Math.cos(seg * Math.PI) * 35,
        };
      } else if (p <= 0.76) {
        const seg = (p - 0.60) / 0.16;
        return {
          x: 390 - seg * 230,
          y: 160 + seg * 90,
        };
      } else {
        const seg = (p - 0.76) / 0.24;
        return {
          x: 160 + Math.sin(seg * Math.PI) * 50 + seg * 20,
          y: 250 + seg * 230,
        };
      }
    } else if (circuitId === 'monza') {
      // Monza spline
      if (p <= 0.25) {
        const seg = p / 0.25;
        return { x: 200 + seg * 600, y: 500 };
      } else if (p <= 0.45) {
        const seg = (p - 0.25) / 0.2;
        return { x: 800 + Math.sin(seg * Math.PI) * 80, y: 500 - seg * 300 };
      } else if (p <= 0.70) {
        const seg = (p - 0.45) / 0.25;
        return { x: 800 - seg * 570, y: 200 - Math.sin(seg * Math.PI) * 150 };
      } else {
        const seg = (p - 0.70) / 0.3;
        return { x: 230 - Math.sin(seg * Math.PI) * 100 - (1 - seg) * 30, y: 150 + seg * 350 };
      }
    } else {
      // Default / Silverstone loop
      const angle = p * Math.PI * 2;
      return {
        x: 500 + Math.cos(angle) * 350 + Math.sin(angle * 2) * 50,
        y: 300 + Math.sin(angle) * 180 + Math.cos(angle * 3) * 30,
      };
    }
  };

  const visibleDrivers = useMemo(() => {
    if (displayFilter === 'TOP_5') {
      return drivers.filter((d) => d.position <= 5 || d.driverCode === selectedDriverCode);
    }
    if (displayFilter === 'SELECTED_ONLY') {
      return drivers.filter((d) => d.position === 1 || d.driverCode === selectedDriverCode);
    }
    return drivers;
  }, [drivers, displayFilter, selectedDriverCode]);

  return (
    <div className="flex flex-col bg-[#0d0f15] rounded-xl border border-white/10 p-4 lg:p-6 shadow-2xl">
      {/* Top Header & Track Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#e10600] rounded-xs" />
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white font-f1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-500" />
              Real-Time Driver Tracking System
            </h2>
            <div className="text-xs text-neutral-400 font-mono-nums flex items-center gap-2 mt-0.5">
              <span>{circuit.name}</span>
              <span>·</span>
              <span>{circuit.circuitLengthKm} km</span>
              <span>·</span>
              <span>{visibleDrivers.length} of 20 Cars Tracked</span>
              {isSimulating && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE GPS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Controls & Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Track Selection */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            {CIRCUITS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCircuitId(c.id)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  selectedCircuitId === c.id
                    ? 'bg-[#e10600] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Grid Visibility Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setDisplayFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                displayFilter === 'ALL' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All 20 Cars
            </button>
            <button
              onClick={() => setDisplayFilter('TOP_5')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                displayFilter === 'TOP_5' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Top 5
            </button>
            <button
              onClick={() => setDisplayFilter('SELECTED_ONLY')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                displayFilter === 'SELECTED_ONLY' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Leader &amp; Focus
            </button>
          </div>
        </div>
      </div>

      {/* Weather Station & Key Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-3 text-xs">
        {/* Leader Highlight Legend */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-amber-500/30 flex items-center gap-2.5 font-mono">
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-[10px] shadow-lg shadow-amber-500/50">
            <Trophy className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-neutral-400">Race Leader</div>
            <div className="text-xs font-black text-amber-300 font-f1">
              P1 {leader.driverCode} ({leader.driverName.split(' ')[1]})
            </div>
          </div>
        </div>

        {/* Selected Driver Legend */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-sky-500/30 flex items-center gap-2.5 font-mono">
          <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-black font-black text-[10px] shadow-lg shadow-sky-500/50">
            <Target className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-neutral-400">Target Driver</div>
            <div className="text-xs font-black text-sky-300 font-f1">
              P{selectedDriver.position} {selectedDriver.driverCode}
            </div>
          </div>
        </div>

        {/* Track Temp */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5 font-mono-nums">
          <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-neutral-400">Track Temp</div>
            <div className="text-xs font-black text-white">{trackTemp.toFixed(1)}°C</div>
          </div>
        </div>

        {/* Air Temp */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5 font-mono-nums">
          <Thermometer className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-neutral-400">Air Temp</div>
            <div className="text-xs font-black text-white">{airTemp.toFixed(1)}°C</div>
          </div>
        </div>

        {/* Wind */}
        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5 font-mono-nums">
          <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-neutral-400">Wind Velocity</div>
            <div className="text-xs font-black text-white">{windSpeed.toFixed(1)} km/h NW</div>
          </div>
        </div>
      </div>

      {/* Main Interactive 2D Circuit Map Canvas */}
      <div className="relative flex-1 min-h-[480px] bg-[#080a0f] rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
        {/* Ambient telemetry coordinate grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg viewBox="0 0 1000 600" className="w-full h-full max-h-[550px] select-none">
          <defs>
            {/* Glowing gold filter for Leader */}
            <filter id="leaderGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing cyan radar filter for Selected Driver */}
            <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track Run-off / Curb Border */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#181d29"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* High-traction Racing Surface */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#242b3b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Racing Line (Apex Path) */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#3a455c"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeOpacity="0.4"
          />

          {/* DRS Zone 1: Main Straight */}
          <path
            d="M 180,480 L 780,480"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeDasharray="10 5"
            strokeOpacity="0.9"
          />

          {/* Start / Finish Gantry Line */}
          <g>
            <line x1="300" y1="462" x2="300" y2="498" stroke="#ffffff" strokeWidth="4" />
            <rect x="260" y="504" width="80" height="18" rx="3" fill="#131722" stroke="#ffffff" strokeWidth="1" />
            <text x="300" y="516" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              START / FINISH
            </text>
          </g>

          {/* Corner Numbers */}
          {circuit.turns.map((turn) => (
            <g key={turn.number}>
              <circle cx={turn.x} cy={turn.y} r="8.5" fill="#0d0f15" stroke="#3f3f46" strokeWidth="1.5" />
              <text
                x={turn.x}
                y={turn.y + 3}
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {turn.number}
              </text>
            </g>
          ))}

          {/* Speed Traps */}
          {circuit.speedTraps.map((st, idx) => (
            <g key={idx}>
              <rect
                x={st.x - 35}
                y={st.y - 28}
                width="70"
                height="18"
                rx="4"
                fill="#000000"
                fillOpacity="0.9"
                stroke="#e10600"
                strokeWidth="1.2"
              />
              <text
                x={st.x}
                y={st.y - 15}
                fill="#ffffff"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {st.label}
              </text>
            </g>
          ))}

          {/* ALL 20 DRIVER BLIPS ON TRACK */}
          {visibleDrivers.map((driver) => {
            const coords = getCoordinatesForProgress(driver.lapDistanceProgress, circuit.id);
            const isLeader = driver.position === 1;
            const isSelected = driver.driverCode === selectedDriverCode;

            return (
              <g
                key={driver.driverNumber}
                onClick={() => onSelectDriver(driver.driverCode)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* 1. LEADER BEACON (Prominent Gold Halo & Beacon) */}
                {isLeader && (
                  <g>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="22"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin"
                    />
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="16"
                      fill="#f59e0b"
                      fillOpacity="0.25"
                      filter="url(#leaderGlow)"
                    />
                    {/* Floating Leader Callout */}
                    <rect
                      x={coords.x - 30}
                      y={coords.y - 38}
                      width="60"
                      height="18"
                      rx="3"
                      fill="#f59e0b"
                      className="shadow-lg"
                    />
                    <text
                      x={coords.x}
                      y={coords.y - 25}
                      fill="#000000"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      👑 P1 {driver.driverCode}
                    </text>
                  </g>
                )}

                {/* 2. SELECTED DRIVER SPOTLIGHT (Targeting reticle & cyan radar ring) */}
                {isSelected && !isLeader && (
                  <g>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="20"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                      className="animate-spin"
                    />
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="14"
                      fill="#38bdf8"
                      fillOpacity="0.2"
                      filter="url(#selectedGlow)"
                    />
                    {/* Targeting Crosshairs */}
                    <line x1={coords.x - 24} y1={coords.y} x2={coords.x - 14} y2={coords.y} stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={coords.x + 14} y1={coords.y} x2={coords.x + 24} y2={coords.y} stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={coords.x} y1={coords.y - 24} x2={coords.x} y2={coords.y - 14} stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={coords.x} y1={coords.y + 14} x2={coords.x} y2={coords.y + 24} stroke="#38bdf8" strokeWidth="1.5" />
                  </g>
                )}

                {/* Driver Car Body Circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isLeader ? '10' : isSelected ? '9.5' : '8'}
                  fill={driver.teamColor}
                  stroke={isLeader ? '#f59e0b' : isSelected ? '#38bdf8' : '#ffffff'}
                  strokeWidth={isLeader || isSelected ? '2.5' : '1.5'}
                />

                {/* Driver Position Number Badge */}
                <text
                  x={coords.x}
                  y={coords.y + 3}
                  fill="#ffffff"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {driver.position}
                </text>

                {/* Driver Code Label (if not leader which has callout above) */}
                {!isLeader && (
                  <text
                    x={coords.x}
                    y={coords.y - 13}
                    fill={isSelected ? '#38bdf8' : '#ffffff'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {driver.driverCode}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Driver Real-Time Telemetry HUD Overlay (Top-Right) */}
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-sky-500/40 text-xs text-white shadow-2xl max-w-xs font-mono-nums pointer-events-auto">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedDriver.teamColor }} />
              <div>
                <span className="font-black font-f1 text-sm tracking-wide">{selectedDriver.driverName}</span>
                <span className="text-[10px] text-neutral-400 block">
                  P{selectedDriver.position} · #{selectedDriver.driverNumber} · {selectedDriver.teamName}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
              TARGET
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {/* Speed Gauge */}
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>SPEED</span>
                <span className="font-bold text-white text-xs">{selectedDriver.currentSpeed} km/h</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedDriver.currentSpeed / 355) * 100)}%` }}
                />
              </div>
            </div>

            {/* Throttle & Brake */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span>THROTTLE</span>
                  <span className="text-emerald-400 font-bold">{selectedDriver.currentThrottle}%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${selectedDriver.currentThrottle}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span>BRAKE</span>
                  <span className="text-red-400 font-bold">{selectedDriver.currentBrake}%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${selectedDriver.currentBrake}%` }} />
                </div>
              </div>
            </div>

            {/* Gear, DRS, Gap */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-neutral-500 block">GEAR</span>
                <span className="font-bold text-yellow-400 text-xs">G{selectedDriver.currentGear}</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-neutral-500 block">DRS</span>
                <span className={selectedDriver.drsActive ? 'font-bold text-emerald-400 text-xs' : 'text-neutral-500 text-xs'}>
                  {selectedDriver.drsActive ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-neutral-500 block">GAP</span>
                <span className="font-bold text-neutral-200 text-xs">{selectedDriver.gapToLeader}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Driver Selector Row at bottom of map */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto py-1.5 px-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 scrollbar-thin">
          <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap pr-1">FOCUS:</span>
          {drivers.map((d) => (
            <button
              key={d.driverCode}
              onClick={() => onSelectDriver(d.driverCode)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                d.driverCode === selectedDriverCode
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/30'
                  : d.position === 1
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
              <span>{d.driverCode}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
