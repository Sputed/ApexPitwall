import React, { useState } from 'react';
import { CIRCUITS } from '../data/circuits';
import { DriverTiming, TrackCircuit } from '../types/f1';
import { Compass, Wind, Thermometer, Droplets, MapPin, Gauge } from 'lucide-react';

interface TrackMapProps {
  drivers: DriverTiming[];
  selectedDriverCode: string;
  onSelectDriver: (code: string) => void;
  airTemp?: number;
  trackTemp?: number;
  windSpeed?: number;
}

export const TrackMap: React.FC<TrackMapProps> = ({
  drivers,
  selectedDriverCode,
  onSelectDriver,
  airTemp = 26.8,
  trackTemp = 39.4,
  windSpeed = 11.2,
}) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('baku');
  const circuit = CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[0];

  const selectedDriver = drivers.find((d) => d.driverCode === selectedDriverCode) || drivers[0];

  return (
    <div className="flex flex-col h-full bg-[#0d0f15] rounded-xl border border-white/10 p-4 lg:p-6 shadow-2xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#e10600] rounded-xs" />
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white font-f1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-500" />
              Live GPS Track Map &amp; Sector Telemetry
            </h2>
            <div className="text-xs text-neutral-400 font-mono-nums flex items-center gap-2 mt-0.5">
              <span>{circuit.name}</span>
              <span>·</span>
              <span>{circuit.circuitLengthKm} km</span>
              <span>·</span>
              <span>{circuit.corners} Turns</span>
              <span>·</span>
              <span>{circuit.drsZones} DRS Zones</span>
            </div>
          </div>
        </div>

        {/* Circuit Switcher */}
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
      </div>

      {/* Weather Station bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="font-mono-nums">
            <div className="text-[10px] uppercase text-neutral-400">Track Temp</div>
            <div className="text-sm font-black text-white">{trackTemp.toFixed(1)}°C</div>
          </div>
        </div>

        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="font-mono-nums">
            <div className="text-[10px] uppercase text-neutral-400">Air Temp</div>
            <div className="text-sm font-black text-white">{airTemp.toFixed(1)}°C</div>
          </div>
        </div>

        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="font-mono-nums">
            <div className="text-[10px] uppercase text-neutral-400">Wind Velocity</div>
            <div className="text-sm font-black text-white">{windSpeed.toFixed(1)} km/h NW</div>
          </div>
        </div>

        <div className="bg-[#131722] p-2.5 rounded-lg border border-white/5 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="font-mono-nums">
            <div className="text-[10px] uppercase text-neutral-400">Rainfall Risk</div>
            <div className="text-sm font-black text-emerald-400">0% (DRY)</div>
          </div>
        </div>
      </div>

      {/* SVG Circuit Canvas */}
      <div className="relative flex-1 min-h-[380px] bg-[#090b10] rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
        {/* Subtle grid backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg viewBox="0 0 1000 600" className="w-full h-full max-h-[500px] select-none">
          <defs>
            {/* Glow filter for active driver blip */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Circuit Outline Shadow/Base */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#1c212d"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Asphalt Surface */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#262d3d"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DRS Zone 1 (Neftchilar straight) */}
          <path
            d="M 180,480 L 780,480"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray="8 4"
            strokeOpacity="0.8"
          />

          {/* Start / Finish Line */}
          <line x1="300" y1="468" x2="300" y2="492" stroke="#ffffff" strokeWidth="3" />
          <text x="300" y="510" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">
            FINISH LINE
          </text>

          {/* Turn Markers */}
          {circuit.turns.map((turn) => (
            <g key={turn.number}>
              <circle cx={turn.x} cy={turn.y} r="8" fill="#131722" stroke="#3f3f46" strokeWidth="1.5" />
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
                x={st.x - 30}
                y={st.y - 25}
                width="60"
                height="16"
                rx="3"
                fill="#000000"
                fillOpacity="0.85"
                stroke="#e10600"
                strokeWidth="1"
              />
              <text
                x={st.x}
                y={st.y - 14}
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {st.label}
              </text>
            </g>
          ))}

          {/* Driver Markers on Circuit Track */}
          {drivers.slice(0, 10).map((driver, index) => {
            // Compute animated position along circuit path
            // For Baku SVG path, approximate parametric points along loop
            const progress = (driver.lapDistanceProgress + index * 0.08) % 1;
            let cx = 180 + progress * 600;
            let cy = 480;

            if (progress > 0.4 && progress <= 0.6) {
              cx = 780 - (progress - 0.4) * 500;
              cy = 200 + Math.sin(progress * 15) * 100;
            } else if (progress > 0.6) {
              cx = 280 - (progress - 0.6) * 200;
              cy = 300 + (progress - 0.6) * 400;
            }

            const isSelected = driver.driverCode === selectedDriverCode;

            return (
              <g
                key={driver.driverNumber}
                onClick={() => onSelectDriver(driver.driverCode)}
                className="cursor-pointer transition-transform hover:scale-125"
              >
                {/* Glow ring for selected driver */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="14"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="animate-spin"
                  />
                )}

                {/* Driver circle dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? "9" : "7"}
                  fill={driver.teamColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  filter={isSelected ? "url(#glow)" : undefined}
                />

                {/* Driver Code Label */}
                <text
                  x={cx}
                  y={cy - 12}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  {driver.driverCode}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Driver Spotlight Widget */}
        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md p-3.5 rounded-lg border border-white/15 text-xs text-white shadow-xl max-w-xs font-mono-nums">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedDriver.teamColor }} />
            <span className="font-black font-f1 text-sm">{selectedDriver.driverName}</span>
            <span className="text-[11px] text-neutral-400">#{selectedDriver.driverNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-neutral-500">SPEED:</span>{' '}
              <span className="font-bold text-white">{selectedDriver.currentSpeed} km/h</span>
            </div>
            <div>
              <span className="text-neutral-500">GEAR:</span>{' '}
              <span className="font-bold text-yellow-400">{selectedDriver.currentGear}</span>
            </div>
            <div>
              <span className="text-neutral-500">DRS:</span>{' '}
              <span className={selectedDriver.drsActive ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                {selectedDriver.drsActive ? 'AVAILABLE' : 'OFF'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">PRACTICE BEST:</span>{' '}
              <span className="font-bold text-neutral-200">{selectedDriver.bestLapTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
