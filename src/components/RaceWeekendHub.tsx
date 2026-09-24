import React from 'react';
import { GrandPrixEvent } from '../types/f1';
import { Calendar, MapPin, Clock, Flag, Trophy, ExternalLink } from 'lucide-react';
import bakuImage from '../assets/images/f1_azerbaijan_baku_1790239402036.jpg';

interface RaceWeekendHubProps {
  currentEvent: GrandPrixEvent;
  onOpenStream: () => void;
  onOpenChannel4?: () => void;
}

export const RaceWeekendHub: React.FC<RaceWeekendHubProps> = ({ currentEvent, onOpenStream, onOpenChannel4 }) => {
  const weekendSchedule = [
    { name: 'Practice 1 (FP1)', date: 'Thursday, 24 Sep', time: '11:30 - 12:30 Local', status: 'LIVE NOW' },
    { name: 'Practice 2 (FP2)', date: 'Thursday, 24 Sep', time: '15:00 - 16:00 Local', status: 'UPCOMING' },
    { name: 'Practice 3 (FP3)', date: 'Friday, 25 Sep', time: '12:30 - 13:30 Local', status: 'UPCOMING' },
    { name: 'Qualifying', date: 'Friday, 25 Sep', time: '16:00 - 17:00 Local', status: 'UPCOMING' },
    { name: 'Grand Prix (51 Laps)', date: 'Saturday, 26 Sep', time: '15:00 Local', status: 'UPCOMING' },
  ];

  return (
    <div className="bg-[#0d0f15] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Hero Banner with Baku City Circuit generated image */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden">
        <img
          src={bakuImage}
          alt="Baku City Circuit Azerbaijan Grand Prix"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f15] via-[#0d0f15]/50 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#e10600] text-[10px] font-black uppercase text-white font-f1 tracking-wider animate-pulse">
                ROUND 17 · LIVE RACE WEEKEND
              </span>
              <span className="text-xs text-neutral-300 font-medium">Baku City Circuit</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase font-f1 tracking-tight">
              {currentEvent.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenChannel4 && (
              <button
                onClick={onOpenChannel4}
                className="px-3.5 py-2 bg-[#00E5FF] hover:bg-[#00cbe2] text-black text-xs font-black uppercase rounded-lg shadow-lg shadow-[#00E5FF]/30 transition-all flex items-center gap-2 cursor-pointer font-mono"
              >
                <span>Channel 4 UK F1 Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onOpenStream}
              className="px-3.5 py-2 bg-[#e10600] hover:bg-[#c30500] text-white text-xs font-bold uppercase rounded-lg shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Sky Sports F1</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekend Timetable & Sessions */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-t border-white/5">
        {weekendSchedule.map((session, idx) => {
          const isLive = session.status === 'LIVE NOW';
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-all ${
                isLive
                  ? 'bg-red-500/10 border-red-500/40 shadow-sm shadow-red-500/10'
                  : 'bg-[#131722] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-neutral-400 font-semibold">{session.date}</span>
                {isLive ? (
                  <span className="px-1.5 py-0.2 rounded bg-red-500 text-[9px] font-black text-white font-mono animate-pulse">
                    LIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-neutral-500">{session.status}</span>
                )}
              </div>
              <div className="font-bold text-xs text-white mb-0.5">{session.name}</div>
              <div className="text-[11px] text-neutral-400 font-mono-nums">{session.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
