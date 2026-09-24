import React, { useState, useMemo } from 'react';
import { DriverTiming, TelemetryPoint } from '../types/f1';
import { generateLapTelemetry } from '../data/telemetryData';
import { TireDegradationChart } from './TireDegradationChart';
import {
  Gauge,
  Zap,
  Activity,
  GitCompare,
  ChevronDown,
  ExternalLink,
  Disc,
  LineChart,
  Layers,
} from 'lucide-react';

interface TelemetryLabProps {
  drivers: DriverTiming[];
  primaryDriverCode: string;
  onSelectPrimaryDriver: (code: string) => void;
  secondaryDriverCode: string;
  onSelectSecondaryDriver: (code: string) => void;
  onSelectTimingSource?: (source: 'formula-timer' | 'f1pedia') => void;
  onLaunchChannel4?: () => void;
  onOpenOpenF1?: () => void;
  currentLap?: number;
  totalLaps?: number;
}

export const TelemetryLab: React.FC<TelemetryLabProps> = ({
  drivers,
  primaryDriverCode,
  onSelectPrimaryDriver,
  secondaryDriverCode,
  onSelectSecondaryDriver,
  onLaunchChannel4,
  onOpenOpenF1,
  currentLap = 18,
  totalLaps = 51,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeEngineeringView, setActiveEngineeringView] = useState<'tire-deg' | 'gps-telemetry' | 'both'>('tire-deg');

  const driver1 = drivers.find((d) => d.driverCode === primaryDriverCode) || drivers[0];
  const driver2 = drivers.find((d) => d.driverCode === secondaryDriverCode) || drivers[1];

  // Generate high-resolution telemetry traces for selected drivers
  const trace1 = useMemo(() => {
    return generateLapTelemetry(driver1.driverCode, driver1.driverName, driver1.teamColor, 103.184, 0);
  }, [driver1]);

  const trace2 = useMemo(() => {
    const deltaMs =
      Math.round(
        (parseFloat(driver2.bestLapTime.split(':')[1]) - parseFloat(driver1.bestLapTime.split(':')[1])) *
          1000
      ) || 120;
    return generateLapTelemetry(driver2.driverCode, driver2.driverName, driver2.teamColor, 103.184, deltaMs);
  }, [driver2, driver1]);

  const totalPoints = trace1.points.length;
  const currentIdx = hoverIndex !== null ? hoverIndex : Math.floor(totalPoints * 0.45);
  const point1 = trace1.points[currentIdx] || trace1.points[0];
  const point2 = trace2.points[currentIdx] || trace2.points[0];

  // SVG Chart Dimensions for GPS Speed
  const chartWidth = 900;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxDistance = 6003;
  const maxSpeed = 360;

  // Path generators for GPS Speed SVG
  const speedPath1 = useMemo(() => {
    return trace1.points
      .map((p, idx) => {
        const x = padding.left + (p.distance / maxDistance) * graphWidth;
        const y = padding.top + graphHeight - (p.speed / maxSpeed) * graphHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [trace1, graphWidth, graphHeight]);

  const speedPath2 = useMemo(() => {
    return trace2.points
      .map((p, idx) => {
        const x = padding.left + (p.distance / maxDistance) * graphWidth;
        const y = padding.top + graphHeight - (p.speed / maxSpeed) * graphHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [trace2, graphWidth, graphHeight]);

  const corners = [
    { name: 'T1', dist: 950 },
    { name: 'T2', dist: 1500 },
    { name: 'T3', dist: 2200 },
    { name: 'T8 Castle', dist: 3250 },
    { name: 'T15', dist: 4150 },
    { name: 'T16 Exit', dist: 4400 },
  ];

  return (
    <div className="flex flex-col gap-5 bg-[#0d0f15] rounded-xl border border-white/10 p-4 lg:p-6 shadow-2xl">
      {/* Top Controls: Driver Comparison Selectors & Engineering Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#e10600] rounded-xs" />
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white font-f1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              Formula 1 Telemetry Engineering Lab
            </h2>
            <p className="text-xs text-neutral-400">
              D3 Tire Degradation &amp; Pit Strategy analysis alongside GPS telemetry comparison
            </p>
          </div>
        </div>

        {/* Driver Comparators */}
        <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-lg border border-white/10">
          {/* Driver 1 Selector */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: driver1.teamColor }} />
            <select
              value={primaryDriverCode}
              onChange={(e) => onSelectPrimaryDriver(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.driverCode} value={d.driverCode} className="bg-[#131722] text-white">
                  {d.driverCode} - {d.driverName} ({d.bestLapTime})
                </option>
              ))}
            </select>
          </div>

          <div className="text-neutral-500 font-mono text-xs font-bold">VS</div>

          {/* Driver 2 Selector */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: driver2.teamColor }} />
            <select
              value={secondaryDriverCode}
              onChange={(e) => onSelectSecondaryDriver(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.driverCode} value={d.driverCode} className="bg-[#131722] text-white">
                  {d.driverCode} - {d.driverName} ({d.bestLapTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Engineering Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveEngineeringView('tire-deg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeEngineeringView === 'tire-deg'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Tire Degradation &amp; Pit Strategy (D3)</span>
          </button>

          <button
            onClick={() => setActiveEngineeringView('gps-telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeEngineeringView === 'gps-telemetry'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Lap GPS Speed &amp; Channels</span>
          </button>

          <button
            onClick={() => setActiveEngineeringView('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeEngineeringView === 'both'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined Engineering Stack</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {onOpenOpenF1 && (
            <button
              onClick={onOpenOpenF1}
              className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open OpenF1 Live Telemetry Engine"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>OpenF1 API Hub</span>
            </button>
          )}

          {onLaunchChannel4 && (
            <button
              onClick={onLaunchChannel4}
              className="px-2.5 py-1 rounded bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Launch Channel 4 Stream in Website"
            >
              <span>▶ Launch Channel 4</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 text-neutral-400">
            <span>Lap:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold font-mono-nums">
              {currentLap}/{totalLaps}
            </span>
          </div>
        </div>
      </div>

      {/* MODULE 1: D3 TIRE DEGRADATION & PIT STOP STRATEGY CHART */}
      {(activeEngineeringView === 'tire-deg' || activeEngineeringView === 'both') && (
        <TireDegradationChart
          driver1={driver1}
          driver2={driver2}
          currentLap={currentLap}
          totalLaps={totalLaps}
        />
      )}

      {/* MODULE 2: HIGH-FREQUENCY GPS LAP TELEMETRY TRACES */}
      {(activeEngineeringView === 'gps-telemetry' || activeEngineeringView === 'both') && (
        <div className="space-y-4">
          {/* Real-time Telemetry Scrubber Inspection HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Metric 1: Speed */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Vehicle Speed</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-white" style={{ color: driver1.teamColor }}>
                  {point1.speed}
                </span>
                <span className="text-xs text-neutral-500">vs</span>
                <span className="text-lg font-black" style={{ color: driver2.teamColor }}>
                  {point2.speed}
                </span>
                <span className="text-[10px] text-neutral-400">km/h</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                Delta:{' '}
                {point1.speed - point2.speed >= 0
                  ? `+${point1.speed - point2.speed}`
                  : point1.speed - point2.speed}{' '}
                km/h
              </div>
            </div>

            {/* Metric 2: Throttle */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Throttle %</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-400">{point1.throttle}%</span>
                <span className="text-xs text-neutral-500">vs</span>
                <span className="text-lg font-black text-emerald-300">{point2.throttle}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full" style={{ width: `${point1.throttle}%` }} />
              </div>
            </div>

            {/* Metric 3: Brake */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Brake %</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-red-500">{point1.brake}%</span>
                <span className="text-xs text-neutral-500">vs</span>
                <span className="text-lg font-black text-red-400">{point2.brake}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-red-500 h-full" style={{ width: `${point1.brake}%` }} />
              </div>
            </div>

            {/* Metric 4: Gear */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Gear Position</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-yellow-400">G{point1.gear}</span>
                <span className="text-xs text-neutral-500">vs</span>
                <span className="text-lg font-black text-yellow-300">G{point2.gear}</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">RPM: {point1.rpm}</div>
            </div>

            {/* Metric 5: DRS */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">DRS Wing Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    point1.drs
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-neutral-500'
                  }`}
                >
                  {driver1.driverCode}: {point1.drs ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                {driver2.driverCode}: {point2.drs ? 'OPEN' : 'CLOSED'}
              </div>
            </div>

            {/* Metric 6: Track Location */}
            <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Track Distance</div>
              <div className="text-base font-black text-white">{point1.distance}m</div>
              <div className="text-[10px] text-sky-400 mt-1">
                {point1.distance > 4400
                  ? 'Neftchilar Straight'
                  : point1.distance > 3100
                  ? 'Castle Complex'
                  : 'Sector 1'}
              </div>
            </div>
          </div>

          {/* Main SVG Telemetry Chart Viewport */}
          <div className="relative bg-[#090b10] rounded-xl border border-white/10 p-2 overflow-hidden">
            {/* Channel Indicator Tabs */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-white uppercase font-f1 text-[11px] tracking-wider">
                  Channel: GPS Speed Trace (km/h)
                </span>
                <div className="flex items-center gap-3 font-mono-nums text-[11px]">
                  <span className="flex items-center gap-1.5" style={{ color: driver1.teamColor }}>
                    <span className="w-2.5 h-1 rounded" style={{ backgroundColor: driver1.teamColor }} />
                    {driver1.driverCode} ({driver1.bestLapTime})
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: driver2.teamColor }}>
                    <span className="w-2.5 h-1 rounded" style={{ backgroundColor: driver2.teamColor }} />
                    {driver2.driverCode} ({driver2.bestLapTime})
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">Baku City Circuit (6,003m)</div>
            </div>

            {/* SVG Telemetry Canvas */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[700px] select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * chartWidth;
                  const ratio = Math.max(0, Math.min(1, (svgX - padding.left) / graphWidth));
                  setHoverIndex(Math.floor(ratio * (totalPoints - 1)));
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Grid Lines */}
                {[100, 200, 300].map((s) => {
                  const y = padding.top + graphHeight - (s / maxSpeed) * graphHeight;
                  return (
                    <g key={s}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#ffffff"
                        strokeOpacity="0.08"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        fill="#71717a"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {s}
                      </text>
                    </g>
                  );
                })}

                {/* Corner Markers */}
                {corners.map((c) => {
                  const x = padding.left + (c.dist / maxDistance) * graphWidth;
                  return (
                    <g key={c.name}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + graphHeight}
                        stroke="#ffffff"
                        strokeOpacity="0.12"
                      />
                      <text
                        x={x}
                        y={padding.top + graphHeight + 16}
                        fill="#a1a1aa"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {c.name}
                      </text>
                    </g>
                  );
                })}

                {/* Driver 2 Trace Line */}
                <path
                  d={speedPath2}
                  fill="none"
                  stroke={driver2.teamColor}
                  strokeWidth="2"
                  strokeOpacity="0.75"
                  strokeDasharray="4 2"
                />

                {/* Driver 1 Trace Line (Primary) */}
                <path
                  d={speedPath1}
                  fill="none"
                  stroke={driver1.teamColor}
                  strokeWidth="2.5"
                />

                {/* Hover Cursor Vertical Line */}
                {hoverIndex !== null && (
                  <g>
                    <line
                      x1={padding.left + (point1.distance / maxDistance) * graphWidth}
                      y1={padding.top}
                      x2={padding.left + (point1.distance / maxDistance) * graphWidth}
                      y2={padding.top + graphHeight}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={padding.left + (point1.distance / maxDistance) * graphWidth}
                      cy={padding.top + graphHeight - (point1.speed / maxSpeed) * graphHeight}
                      r="4"
                      fill={driver1.teamColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={padding.left + (point2.distance / maxDistance) * graphWidth}
                      cy={padding.top + graphHeight - (point2.speed / maxSpeed) * graphHeight}
                      r="4"
                      fill={driver2.teamColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Scrubber instructions & External Telemetry Links */}
            <div className="px-3 py-2 bg-[#0d0f15] text-[10px] text-neutral-400 font-mono flex flex-wrap items-center justify-between border-t border-white/5 gap-2">
              <span>Move mouse cursor across chart to scrub telemetry along track distance</span>
              <div className="flex items-center gap-3">
                <span className="text-neutral-500">Live Telemetry Feeds:</span>
                <a
                  href="https://formula-timer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <span>formula-timer.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span>·</span>
                <a
                  href="https://f1pedia.com/en/live-timing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                >
                  <span>f1pedia.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
