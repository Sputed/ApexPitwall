import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DriverTiming, TyreCompound } from '../types/f1';
import {
  Disc,
  Clock,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Zap,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface StintData {
  stintNumber: number;
  compound: TyreCompound;
  compoundColor: string;
  startLap: number;
  endLap: number;
  pitLap?: number;
  pitDurationSec?: number;
}

interface LapDegPoint {
  lap: number;
  gripPercent: number; // 0 - 100%
  lapTimePenaltySec: number; // +0.00s to +2.50s
  compound: TyreCompound;
  compoundColor: string;
  stintNumber: number;
  tyreAgeLaps: number;
  isPitLap: boolean;
  isProjected: boolean;
}

interface DriverStrategyProfile {
  driver: DriverTiming;
  stints: StintData[];
  dataPoints: LapDegPoint[];
  totalPitStops: number;
  totalPitTimeSec: number;
  cliffLap: number;
}

interface TireDegradationChartProps {
  driver1: DriverTiming;
  driver2: DriverTiming;
  currentLap?: number;
  totalLaps?: number;
}

export const TireDegradationChart: React.FC<TireDegradationChartProps> = ({
  driver1,
  driver2,
  currentLap = 18,
  totalLaps = 51,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [metricMode, setMetricMode] = useState<'grip' | 'pace'>('grip');
  const [hoverLap, setHoverLap] = useState<number | null>(null);
  const [selectedStintFocus, setSelectedStintFocus] = useState<number | null>(null);

  // Generate realistic race stints & degradation curves for each driver
  const generateDriverStrategy = (
    driver: DriverTiming,
    driverIndex: number
  ): DriverStrategyProfile => {
    const isMediumStart = driver.tyreCompound === 'MEDIUM' || driverIndex === 0;
    const isHardStart = driver.tyreCompound === 'HARD' && driverIndex !== 0;

    let stints: StintData[] = [];
    if (isHardStart) {
      stints = [
        {
          stintNumber: 1,
          compound: 'HARD',
          compoundColor: '#FFFFFF',
          startLap: 1,
          endLap: 27,
          pitLap: 27,
          pitDurationSec: 2.4,
        },
        {
          stintNumber: 2,
          compound: 'MEDIUM',
          compoundColor: '#FFD700',
          startLap: 28,
          endLap: totalLaps,
        },
      ];
    } else if (driver.tyreCompound === 'SOFT') {
      stints = [
        {
          stintNumber: 1,
          compound: 'SOFT',
          compoundColor: '#FF3333',
          startLap: 1,
          endLap: 14,
          pitLap: 14,
          pitDurationSec: 2.2,
        },
        {
          stintNumber: 2,
          compound: 'HARD',
          compoundColor: '#FFFFFF',
          startLap: 15,
          endLap: 36,
          pitLap: 36,
          pitDurationSec: 2.5,
        },
        {
          stintNumber: 3,
          compound: 'MEDIUM',
          compoundColor: '#FFD700',
          startLap: 37,
          endLap: totalLaps,
        },
      ];
    } else {
      // Standard 1-stop Medium -> Hard
      const pitLap = driverIndex === 0 ? 17 : 19;
      stints = [
        {
          stintNumber: 1,
          compound: 'MEDIUM',
          compoundColor: '#FFD700',
          startLap: 1,
          endLap: pitLap,
          pitLap: pitLap,
          pitDurationSec: driverIndex === 0 ? 2.3 : 2.1,
        },
        {
          stintNumber: 2,
          compound: 'HARD',
          compoundColor: '#FFFFFF',
          startLap: pitLap + 1,
          endLap: totalLaps,
        },
      ];
    }

    // Generate lap-by-lap tire grip decay model
    const dataPoints: LapDegPoint[] = [];

    stints.forEach((stint) => {
      const stintLaps = stint.endLap - stint.startLap + 1;

      // Base degradation rates based on compound
      let degRate = 1.45; // % per lap
      let cliffThreshold = 24;
      let initialGrip = 98;

      if (stint.compound === 'SOFT') {
        degRate = 2.4;
        cliffThreshold = 13;
        initialGrip = 100;
      } else if (stint.compound === 'MEDIUM') {
        degRate = 1.55;
        cliffThreshold = 22;
        initialGrip = 97;
      } else if (stint.compound === 'HARD') {
        degRate = 0.92;
        cliffThreshold = 35;
        initialGrip = 94;
      }

      // Small driver delta variation
      if (driverIndex === 1) {
        degRate *= 1.05; // Driver 2 slightly more tyre degradation
      }

      for (let lap = stint.startLap; lap <= stint.endLap; lap++) {
        const tyreAge = lap - stint.startLap;
        let grip = initialGrip - tyreAge * degRate;

        // Exponential drop-off once tyre reaches thermal cliff
        if (tyreAge > cliffThreshold) {
          const overCliff = tyreAge - cliffThreshold;
          grip -= Math.pow(overCliff, 1.4) * 1.2;
        }

        grip = Math.max(38, Math.min(100, grip));

        // Lap time penalty in seconds: inversely proportional to grip
        const pacePenalty = +((100 - grip) * 0.038).toFixed(2);

        dataPoints.push({
          lap,
          gripPercent: +grip.toFixed(1),
          lapTimePenaltySec: pacePenalty,
          compound: stint.compound,
          compoundColor: stint.compoundColor,
          stintNumber: stint.stintNumber,
          tyreAgeLaps: tyreAge,
          isPitLap: lap === stint.pitLap,
          isProjected: lap > currentLap,
        });
      }
    });

    const totalPitStops = stints.length - 1;
    const totalPitTimeSec = stints.reduce((sum, s) => sum + (s.pitDurationSec || 0), 0);

    return {
      driver,
      stints,
      dataPoints,
      totalPitStops,
      totalPitTimeSec,
      cliffLap: isMediumStart ? 22 : 34,
    };
  };

  const profile1 = useMemo(() => generateDriverStrategy(driver1, 0), [driver1, totalLaps, currentLap]);
  const profile2 = useMemo(() => generateDriverStrategy(driver2, 1), [driver2, totalLaps, currentLap]);

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 300;
    const margin = { top: 28, right: 35, bottom: 40, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear().domain([1, totalLaps]).range([0, innerWidth]);

    const yScale =
      metricMode === 'grip'
        ? d3.scaleLinear().domain([35, 102]).range([innerHeight, 0])
        : d3.scaleLinear().domain([0, 2.8]).range([innerHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients and Drop Shadows
    const defs = svg.append('defs');

    // Glow filter for Driver 1
    const filter = defs.append('filter').attr('id', 'glow-deg').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', (d) => d);

    // Shaded Optimal Pit Window Zone (Laps 16 to 23)
    const pitWindowStart = 16;
    const pitWindowEnd = 23;
    g.append('rect')
      .attr('x', xScale(pitWindowStart))
      .attr('y', 0)
      .attr('width', xScale(pitWindowEnd) - xScale(pitWindowStart))
      .attr('height', innerHeight)
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.07);

    // Shaded Tyre Cliff Warning Zone (Bottom 48% grip or Top > 2.0s penalty)
    if (metricMode === 'grip') {
      g.append('rect')
        .attr('x', 0)
        .attr('y', yScale(48))
        .attr('width', innerWidth)
        .attr('height', innerHeight - yScale(48))
        .attr('fill', '#ef4444')
        .attr('fill-opacity', 0.08);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', yScale(43))
        .attr('text-anchor', 'end')
        .attr('fill', '#ef4444')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.6)
        .text('CRITICAL TYRE CLIFF ZONE (<48% GRIP)');
    }

    // Pit Window Annotation
    g.append('text')
      .attr('x', (xScale(pitWindowStart) + xScale(pitWindowEnd)) / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#34d399')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('OPTIMAL PIT WINDOW (L16–L23)');

    // D3 Grid Lines
    const yTicks = metricMode === 'grip' ? [40, 60, 80, 100] : [0.5, 1.0, 1.5, 2.0, 2.5];
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '3 3');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(totalLaps, 12))
      .tickFormat((d) => `L${d}`);

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yTicks)
      .tickFormat((d) => (metricMode === 'grip' ? `${d}%` : `+${d}s`));

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px').attr('font-family', 'monospace');
    xAxisG.selectAll('line').attr('stroke', '#ffffff').attr('stroke-opacity', 0.15);
    xAxisG.select('.domain').attr('stroke', '#ffffff').attr('stroke-opacity', 0.2);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px').attr('font-family', 'monospace');
    yAxisG.selectAll('line').attr('stroke', '#ffffff').attr('stroke-opacity', 0.15);
    yAxisG.select('.domain').attr('stroke', '#ffffff').attr('stroke-opacity', 0.2);

    // D3 Line Generator for Stints
    const getValue = (p: LapDegPoint) => (metricMode === 'grip' ? p.gripPercent : p.lapTimePenaltySec);

    const lineGen = d3
      .line<LapDegPoint>()
      .x((d) => xScale(d.lap))
      .y((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    // Draw Stint Curves for Driver 2 (Secondary)
    profile2.stints.forEach((stint) => {
      const stintPoints = profile2.dataPoints.filter((p) => p.stintNumber === stint.stintNumber);
      const actualPoints = stintPoints.filter((p) => p.lap <= currentLap);
      const projectedPoints = stintPoints.filter((p) => p.lap >= currentLap);

      if (actualPoints.length > 0) {
        g.append('path')
          .datum(actualPoints)
          .attr('fill', 'none')
          .attr('stroke', driver2.teamColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 3')
          .attr('stroke-opacity', 0.8)
          .attr('d', lineGen);
      }

      if (projectedPoints.length > 0) {
        g.append('path')
          .datum(projectedPoints)
          .attr('fill', 'none')
          .attr('stroke', driver2.teamColor)
          .attr('stroke-width', 1.8)
          .attr('stroke-dasharray', '2 4')
          .attr('stroke-opacity', 0.5)
          .attr('d', lineGen);
      }
    });

    // Draw Stint Curves for Driver 1 (Primary - Glow Thicker)
    profile1.stints.forEach((stint) => {
      const stintPoints = profile1.dataPoints.filter((p) => p.stintNumber === stint.stintNumber);
      const actualPoints = stintPoints.filter((p) => p.lap <= currentLap);
      const projectedPoints = stintPoints.filter((p) => p.lap >= currentLap);

      if (actualPoints.length > 0) {
        g.append('path')
          .datum(actualPoints)
          .attr('fill', 'none')
          .attr('stroke', driver1.teamColor)
          .attr('stroke-width', 3)
          .attr('filter', 'url(#glow-deg)')
          .attr('d', lineGen);
      }

      if (projectedPoints.length > 0) {
        g.append('path')
          .datum(projectedPoints)
          .attr('fill', 'none')
          .attr('stroke', driver1.teamColor)
          .attr('stroke-width', 2.2)
          .attr('stroke-dasharray', '4 3')
          .attr('stroke-opacity', 0.7)
          .attr('d', lineGen);
      }
    });

    // Draw Pit Stop Events (Vertical Lines & Markers)
    const pitEvents = [
      ...profile1.stints
        .filter((s) => s.pitLap)
        .map((s) => ({
          driver: driver1,
          profile: profile1,
          lap: s.pitLap!,
          duration: s.pitDurationSec,
          stint: s,
        })),
      ...profile2.stints
        .filter((s) => s.pitLap)
        .map((s) => ({
          driver: driver2,
          profile: profile2,
          lap: s.pitLap!,
          duration: s.pitDurationSec,
          stint: s,
        })),
    ];

    pitEvents.forEach((pit) => {
      const pitX = xScale(pit.lap);
      const isPast = pit.lap <= currentLap;

      // Vertical Pit Stop dashed line
      g.append('line')
        .attr('x1', pitX)
        .attr('y1', 0)
        .attr('x2', pitX)
        .attr('y2', innerHeight)
        .attr('stroke', pit.driver.teamColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 3')
        .attr('stroke-opacity', isPast ? 0.75 : 0.4);

      // Pit Stop Badge at top
      const badgeY = pit.driver.driverCode === driver1.driverCode ? 16 : 38;
      const badgeG = g
        .append('g')
        .attr('transform', `translate(${pitX},${badgeY})`)
        .style('cursor', 'pointer');

      badgeG
        .append('rect')
        .attr('x', -26)
        .attr('y', -10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', '#181e2b')
        .attr('stroke', pit.driver.teamColor)
        .attr('stroke-width', 1.2);

      badgeG
        .append('text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`BOX ${pit.duration}s`);
    });

    // Current Race Lap Vertical Marker
    const currentLapX = xScale(currentLap);
    const liveMarkerG = g
      .append('g')
      .attr('class', 'live-lap-marker')
      .attr('transform', `translate(${currentLapX},0)`);

    liveMarkerG
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e10600')
      .attr('stroke-width', 2);

    liveMarkerG
      .append('polygon')
      .attr('points', '-6,-4 6,-4 0,4')
      .attr('fill', '#e10600');

    liveMarkerG
      .append('rect')
      .attr('x', -28)
      .attr('y', innerHeight - 22)
      .attr('width', 56)
      .attr('height', 18)
      .attr('rx', 3)
      .attr('fill', '#e10600');

    liveMarkerG
      .append('text')
      .attr('x', 0)
      .attr('y', innerHeight - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`L${currentLap} LIVE`);

    // Interactive Hover Overlay using D3 mouse tracking
    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const focusLine = g
      .append('line')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '2 2')
      .style('display', 'none');

    const focusCircle1 = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', driver1.teamColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('display', 'none');

    const focusCircle2 = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', driver2.teamColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('display', 'none');

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const lapRaw = xScale.invert(mx);
        const lap = Math.max(1, Math.min(totalLaps, Math.round(lapRaw)));
        setHoverLap(lap);

        const p1 = profile1.dataPoints.find((d) => d.lap === lap);
        const p2 = profile2.dataPoints.find((d) => d.lap === lap);

        focusLine.style('display', null).attr('x1', xScale(lap)).attr('x2', xScale(lap)).attr('y1', 0).attr('y2', innerHeight);

        if (p1) {
          focusCircle1
            .style('display', null)
            .attr('cx', xScale(lap))
            .attr('cy', yScale(getValue(p1)));
        }
        if (p2) {
          focusCircle2
            .style('display', null)
            .attr('cx', xScale(lap))
            .attr('cy', yScale(getValue(p2)));
        }
      })
      .on('mouseleave', () => {
        setHoverLap(null);
        focusLine.style('display', 'none');
        focusCircle1.style('display', 'none');
        focusCircle2.style('display', 'none');
      });
  }, [profile1, profile2, metricMode, currentLap, totalLaps]);

  const activeLap = hoverLap !== null ? hoverLap : currentLap;
  const hoverPoint1 = profile1.dataPoints.find((d) => d.lap === activeLap) || profile1.dataPoints[0];
  const hoverPoint2 = profile2.dataPoints.find((d) => d.lap === activeLap) || profile2.dataPoints[0];

  const getCompoundBadge = (compound: TyreCompound) => {
    switch (compound) {
      case 'SOFT':
        return { text: 'SOFT (C5)', bg: 'bg-red-500/20 text-red-400 border-red-500/40', dot: 'bg-red-500' };
      case 'MEDIUM':
        return { text: 'MEDIUM (C4)', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', dot: 'bg-yellow-400' };
      case 'HARD':
        return { text: 'HARD (C3)', bg: 'bg-white/10 text-neutral-100 border-white/20', dot: 'bg-white' };
      default:
        return { text: compound, bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' };
    }
  };

  const badge1 = getCompoundBadge(hoverPoint1.compound);
  const badge2 = getCompoundBadge(hoverPoint2.compound);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 bg-[#0d1017] rounded-xl border border-white/10 p-4 lg:p-5 shadow-2xl"
    >
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-f1 font-black text-white text-sm uppercase tracking-wide">
                Tire Degradation &amp; Pit Stop Strategy Analysis
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 font-mono font-bold">
                D3 ENGINE
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Interactive lap-by-lap compound grip decay, thermal cliff curves &amp; pit delta simulator
            </p>
          </div>
        </div>

        {/* Metric Selector (Grip Index % vs Lap Time Penalty +s) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
          <button
            onClick={() => setMetricMode('grip')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              metricMode === 'grip'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tyre Grip (%)
          </button>
          <button
            onClick={() => setMetricMode('pace')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              metricMode === 'pace'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pace Delta (+s/lap)
          </button>
        </div>
      </div>

      {/* Driver Strategy Comparison Cards (Lap Inspection HUD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono-nums">
        {/* Driver 1 Card */}
        <div className="p-3 bg-[#131722] rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: driver1.teamColor }} />
              <span className="font-bold text-white text-sm font-f1">{driver1.driverCode}</span>
              <span className="text-xs text-neutral-400">{driver1.driverName}</span>
            </div>
            <div className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1.5 ${badge1.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge1.dot}`} />
              <span>{badge1.text}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">LAP {activeLap} GRIP</div>
              <div
                className="text-base font-black"
                style={{
                  color:
                    hoverPoint1.gripPercent > 75
                      ? '#34d399'
                      : hoverPoint1.gripPercent > 55
                      ? '#facc15'
                      : '#f87171',
                }}
              >
                {hoverPoint1.gripPercent}%
              </div>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">TYRE AGE</div>
              <div className="text-base font-black text-white">{hoverPoint1.tyreAgeLaps} Laps</div>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">PACE PENALTY</div>
              <div className="text-base font-black text-amber-400">+{hoverPoint1.lapTimePenaltySec}s</div>
            </div>
          </div>

          {/* Stint Overview Bar */}
          <div className="flex items-center gap-1 pt-1 text-[10px] text-neutral-400 font-mono">
            <span>Stints:</span>
            {profile1.stints.map((s, idx) => (
              <span
                key={s.stintNumber}
                className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 flex items-center gap-1 text-white"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.compoundColor }} />
                <span>
                  S{s.stintNumber}: {s.compound[0]} (L{s.startLap}-{s.endLap})
                </span>
                {s.pitDurationSec && <span className="text-emerald-400">[{s.pitDurationSec}s]</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Driver 2 Card */}
        <div className="p-3 bg-[#131722] rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: driver2.teamColor }} />
              <span className="font-bold text-white text-sm font-f1">{driver2.driverCode}</span>
              <span className="text-xs text-neutral-400">{driver2.driverName}</span>
            </div>
            <div className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1.5 ${badge2.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge2.dot}`} />
              <span>{badge2.text}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">LAP {activeLap} GRIP</div>
              <div
                className="text-base font-black"
                style={{
                  color:
                    hoverPoint2.gripPercent > 75
                      ? '#34d399'
                      : hoverPoint2.gripPercent > 55
                      ? '#facc15'
                      : '#f87171',
                }}
              >
                {hoverPoint2.gripPercent}%
              </div>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">TYRE AGE</div>
              <div className="text-base font-black text-white">{hoverPoint2.tyreAgeLaps} Laps</div>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-neutral-500">PACE PENALTY</div>
              <div className="text-base font-black text-amber-400">+{hoverPoint2.lapTimePenaltySec}s</div>
            </div>
          </div>

          {/* Stint Overview Bar */}
          <div className="flex items-center gap-1 pt-1 text-[10px] text-neutral-400 font-mono">
            <span>Stints:</span>
            {profile2.stints.map((s) => (
              <span
                key={s.stintNumber}
                className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 flex items-center gap-1 text-white"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.compoundColor }} />
                <span>
                  S{s.stintNumber}: {s.compound[0]} (L{s.startLap}-{s.endLap})
                </span>
                {s.pitDurationSec && <span className="text-emerald-400">[{s.pitDurationSec}s]</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main D3 SVG Canvas Viewport */}
      <div className="relative bg-[#090b10] rounded-xl border border-white/10 p-2 overflow-hidden select-none">
        {/* Chart Legend Strip */}
        <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-white/5 text-[11px] font-mono gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: driver1.teamColor }} />
              <span>{driver1.driverCode} Degradation Curve</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-3 h-1 rounded border-b border-dashed" style={{ borderColor: driver2.teamColor }} />
              <span>{driver2.driverCode} Degradation Curve</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/50" />
              <span>Optimal Window (L16–L23)</span>
            </span>
          </div>

          <div className="text-neutral-500">Azerbaijan Grand Prix (51 Laps)</div>
        </div>

        {/* SVG Element Target for D3 */}
        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 860 300"
            className="w-full h-auto min-w-[700px]"
          />
        </div>

        {/* Scrubbing Instructions Footer */}
        <div className="px-3 py-2 bg-[#0c0f17] text-[10px] text-neutral-400 font-mono flex flex-wrap items-center justify-between border-t border-white/5 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Hover or drag cursor across chart to inspect tyre degradation at any lap</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span>Solid lines: Actual telemetry</span>
            <span>·</span>
            <span>Dashed lines: Projected stint model</span>
          </div>
        </div>
      </div>

      {/* Strategy Insights & Undercut Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#131722] rounded-xl border border-white/5 space-y-1">
          <div className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            Tire Cliff Risk Analysis
          </div>
          <div className="text-neutral-200">
            {driver1.driverCode} has <strong className="text-emerald-400">~6 laps</strong> before Medium
            reaches thermal cliff. Hard tire degradation expected at{' '}
            <strong className="text-white">0.92% / lap</strong>.
          </div>
        </div>

        <div className="p-3 bg-[#131722] rounded-xl border border-white/5 space-y-1">
          <div className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            Undercut Potential Delta
          </div>
          <div className="text-neutral-200">
            Fresh Hard tires offer <strong className="text-yellow-400">+1.4s/lap</strong> pace delta over 18-lap
            used Mediums. Undercut window is actively viable on Lap {currentLap}.
          </div>
        </div>

        <div className="p-3 bg-[#131722] rounded-xl border border-white/5 space-y-1">
          <div className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            Baku Pit Lane Loss
          </div>
          <div className="text-neutral-200">
            Total pit lane transit time: <strong className="text-white">20.8s</strong> + avg{' '}
            <strong className="text-sky-400">2.3s</strong> stationary stop time (Net pit loss: ~23.1s).
          </div>
        </div>
      </div>
    </div>
  );
};
