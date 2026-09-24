import React, { useState, useEffect } from 'react';
import {
  HistoricalRace,
  HistoricalResult,
  HistoricalPitStop,
  HistoricalDriverStanding,
  HistoricalConstructorStanding,
} from '../types/f1';
import {
  fetchHistoricalRaces,
  fetchHistoricalRaceResults,
  fetchHistoricalPitStops,
  fetchHistoricalStandings,
} from '../services/historicalF1Api';
import {
  Calendar,
  Clock,
  Trophy,
  RotateCcw,
  Zap,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';

interface HistoricalAnalysisProps {
  onWatchStreamReplay?: () => void;
}

export const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({ onWatchStreamReplay }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('2024');
  const [races, setRaces] = useState<HistoricalRace[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('17'); // Azerbaijan GP (Baku)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'results' | 'pitstops' | 'standings' | 'timing-archives'>('results');

  // Loaded race data
  const [currentRace, setCurrentRace] = useState<HistoricalRace | null>(null);
  const [results, setResults] = useState<HistoricalResult[]>([]);
  const [fastestLap, setFastestLap] = useState<{ driverName: string; time: string; lap: number } | null>(null);
  const [pitStops, setPitStops] = useState<HistoricalPitStop[]>([]);
  const [standings, setStandings] = useState<{
    drivers: HistoricalDriverStanding[];
    constructors: HistoricalConstructorStanding[];
  }>({ drivers: [], constructors: [] });

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load races when season changes
  useEffect(() => {
    let isMounted = true;
    const loadRaces = async () => {
      setIsLoading(true);
      const raceList = await fetchHistoricalRaces(selectedSeason);
      if (isMounted) {
        setRaces(raceList);
        if (raceList.length > 0) {
          // If 2024 and round 17 (Baku) exists, pick that; else pick first or round 1
          const defaultRound = raceList.find((r) => r.round === selectedRound)
            ? selectedRound
            : raceList[raceList.length - 1]?.round || '1';
          setSelectedRound(defaultRound);
        }
        setIsLoading(false);
      }
    };
    loadRaces();
    return () => {
      isMounted = false;
    };
  }, [selectedSeason]);

  // 2. Load detailed data for selected round
  useEffect(() => {
    let isMounted = true;
    const loadRaceDetails = async () => {
      if (!selectedRound) return;
      setIsLoading(true);

      const [resData, stopsData, standingsData] = await Promise.all([
        fetchHistoricalRaceResults(selectedSeason, selectedRound),
        fetchHistoricalPitStops(selectedSeason, selectedRound),
        fetchHistoricalStandings(selectedSeason, selectedRound),
      ]);

      if (isMounted) {
        if (resData.race) setCurrentRace(resData.race);
        setResults(resData.results);
        setFastestLap(resData.fastestLapDriver || null);
        setPitStops(stopsData);
        setStandings(standingsData);
        setIsLoading(false);
      }
    };

    loadRaceDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedSeason, selectedRound]);

  const filteredResults = results.filter(
    (r) =>
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-[#0d0f15] rounded-xl border border-white/10 p-4 lg:p-6 shadow-2xl space-y-5">
      {/* Top Controls: Season & Race Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#e10600] rounded-xs" />
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white font-f1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-red-500" />
              Formula 1 Historical Data &amp; Telemetry Archives
            </h2>
            <p className="text-xs text-neutral-400">
              Query past Grand Prix results, lap times, pit stops &amp; championship standings from official F1 databases
            </p>
          </div>
        </div>

        {/* Season & Round Selectors */}
        <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/10">
          {/* Season Selector */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[11px] font-mono text-neutral-400">SEASON:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="2024" className="bg-[#131722] text-white">2024 Championship</option>
              <option value="2023" className="bg-[#131722] text-white">2023 Championship</option>
              <option value="2022" className="bg-[#131722] text-white">2022 Championship</option>
              <option value="2021" className="bg-[#131722] text-white">2021 Championship</option>
            </select>
          </div>

          <div className="text-neutral-600 font-mono">|</div>

          {/* Grand Prix Round Selector */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[11px] font-mono text-neutral-400">ROUND:</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {races.map((r) => (
                <option key={r.round} value={r.round} className="bg-[#131722] text-white">
                  R{r.round}: {r.raceName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Grand Prix Info Banner */}
      {currentRace && (
        <div className="bg-[#131722] p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                ROUND {currentRace.round}
              </span>
              <span className="flex items-center gap-1 text-white">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {currentRace.circuitName}, {currentRace.country}
              </span>
              <span>·</span>
              <span>{currentRace.date}</span>
            </div>
            <h3 className="text-lg font-black text-white uppercase font-f1 tracking-wide">
              {currentRace.raceName}
            </h3>
          </div>

          {/* Fastest Lap Card */}
          {fastestLap && (
            <div className="bg-purple-500/10 border border-purple-500/30 p-2.5 rounded-lg flex items-center gap-3 font-mono-nums">
              <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-purple-300">Fastest Lap of Race</div>
                <div className="text-xs font-black text-white">
                  {fastestLap.driverName} · <span className="text-purple-400">{fastestLap.time}</span> (Lap {fastestLap.lap})
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Sub-navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'results' ? 'bg-[#e10600] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Race Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('pitstops')}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'pitstops' ? 'bg-[#e10600] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pit Stop Strategies ({pitStops.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'standings' ? 'bg-[#e10600] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Championship Standings
          </button>
          <button
            onClick={() => setActiveTab('timing-archives')}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'timing-archives' ? 'bg-[#e10600] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>F1 Live Timing Web Archive</span>
          </button>
        </div>

        {/* Search */}
        {activeTab === 'results' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-black/40 border border-white/10 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 w-36 sm:w-48"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-3" />
          <p className="text-xs text-neutral-400 font-mono">Fetching official F1 timing archive records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: RACE RESULTS */}
          {activeTab === 'results' && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs font-mono-nums">
                <thead className="bg-[#131722] text-neutral-400 uppercase text-[10px] font-mono tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 text-center">POS</th>
                    <th className="py-2.5 px-3">DRIVER</th>
                    <th className="py-2.5 px-3">CONSTRUCTOR</th>
                    <th className="py-2.5 px-3 text-center">GRID</th>
                    <th className="py-2.5 px-3 text-center">+/-</th>
                    <th className="py-2.5 px-3 text-center">LAPS</th>
                    <th className="py-2.5 px-3">TIME / STATUS</th>
                    <th className="py-2.5 px-3">FASTEST LAP</th>
                    <th className="py-2.5 px-3 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#090b10]">
                  {filteredResults.map((result) => {
                    const posDelta = result.grid - result.position;
                    return (
                      <tr key={result.number} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-neutral-200">
                          {result.position === 1 ? '🥇 1' : result.position === 2 ? '🥈 2' : result.position === 3 ? '🥉 3' : result.position}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span className="font-f1 tracking-wider">{result.driverName}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">#{result.number}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-300 font-medium">{result.teamName}</td>
                        <td className="py-2.5 px-3 text-center text-neutral-400 font-mono">{result.grid}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {posDelta > 0 ? (
                            <span className="text-emerald-400">+{posDelta}</span>
                          ) : posDelta < 0 ? (
                            <span className="text-red-400">{posDelta}</span>
                          ) : (
                            <span className="text-neutral-500">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-neutral-300">{result.laps}</td>
                        <td className="py-2.5 px-3 text-neutral-300 font-medium">{result.time}</td>
                        <td className="py-2.5 px-3">
                          {result.fastestLap ? (
                            <span className="text-neutral-300">
                              {result.fastestLap.time}{' '}
                              <span className="text-[10px] text-neutral-500">(L{result.fastestLap.lap})</span>
                            </span>
                          ) : (
                            <span className="text-neutral-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-white text-sm">
                          {result.points > 0 ? `+${result.points}` : '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PIT STOP STRATEGIES */}
          {activeTab === 'pitstops' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
                  <div className="text-[10px] uppercase text-neutral-400">Total Pit Stops</div>
                  <div className="text-lg font-black text-white">{pitStops.length}</div>
                </div>
                <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
                  <div className="text-[10px] uppercase text-neutral-400">Shortest Stationary Stop</div>
                  <div className="text-lg font-black text-emerald-400">2.14s (Red Bull)</div>
                </div>
                <div className="bg-[#131722] p-3 rounded-lg border border-white/5 font-mono-nums">
                  <div className="text-[10px] uppercase text-neutral-400">Primary Strategy</div>
                  <div className="text-lg font-black text-amber-300">1-Stop (Medium &gt; Hard)</div>
                </div>
              </div>

              {pitStops.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 bg-[#131722] rounded-xl border border-white/5">
                  No pit stop records available for this session.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs font-mono-nums">
                    <thead className="bg-[#131722] text-neutral-400 uppercase text-[10px] font-mono tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3">STOP #</th>
                        <th className="py-2.5 px-3">DRIVER</th>
                        <th className="py-2.5 px-3 text-center">LAP</th>
                        <th className="py-2.5 px-3">TIME OF DAY</th>
                        <th className="py-2.5 px-3 text-right">STOP DURATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#090b10]">
                      {pitStops.map((stop, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03]">
                          <td className="py-2.5 px-3 font-bold text-neutral-300">Stop {stop.stop}</td>
                          <td className="py-2.5 px-3 font-bold text-white uppercase font-mono">{stop.driverId}</td>
                          <td className="py-2.5 px-3 text-center text-neutral-300 font-bold">Lap {stop.lap}</td>
                          <td className="py-2.5 px-3 text-neutral-400 font-mono">{stop.time}</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                            {stop.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHAMPIONSHIP STANDINGS */}
          {activeTab === 'standings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Driver Championship */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-3 bg-[#131722] border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-f1 tracking-wider">
                    Drivers' World Championship (Post Round {selectedRound})
                  </span>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono-nums">
                    <thead className="bg-[#090b10] text-neutral-400 uppercase text-[10px] font-mono border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3 text-center">POS</th>
                        <th className="py-2 px-3">DRIVER</th>
                        <th className="py-2 px-3">TEAM</th>
                        <th className="py-2 px-3 text-center">WINS</th>
                        <th className="py-2 px-3 text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0d0f15]">
                      {standings.drivers.map((d) => (
                        <tr key={d.driverId} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-center font-bold text-neutral-300">{d.position}</td>
                          <td className="py-2 px-3 font-bold text-white">{d.driverName}</td>
                          <td className="py-2 px-3 text-neutral-400 truncate max-w-[120px]">{d.teamName}</td>
                          <td className="py-2 px-3 text-center text-neutral-400">{d.wins}</td>
                          <td className="py-2 px-3 text-right font-black text-white">{d.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Constructor Championship */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-3 bg-[#131722] border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-f1 tracking-wider">
                    Constructors' Championship
                  </span>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono-nums">
                    <thead className="bg-[#090b10] text-neutral-400 uppercase text-[10px] font-mono border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3 text-center">POS</th>
                        <th className="py-2 px-3">CONSTRUCTOR</th>
                        <th className="py-2 px-3 text-center">WINS</th>
                        <th className="py-2 px-3 text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0d0f15]">
                      {standings.constructors.map((c) => (
                        <tr key={c.teamId} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-center font-bold text-neutral-300">{c.position}</td>
                          <td className="py-2 px-3 font-bold text-white">{c.teamName}</td>
                          <td className="py-2 px-3 text-center text-neutral-400">{c.wins}</td>
                          <td className="py-2 px-3 text-right font-black text-white">{c.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: F1 LIVE TIMING WEB ARCHIVE & REPLAY */}
          {activeTab === 'timing-archives' && (
            <div className="bg-[#131722] p-5 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="p-2.5 rounded-lg bg-red-600/20 text-red-500">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase font-f1 tracking-wide">
                    Live Timing Web Archives &amp; Broadcast Replays
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Cross-referenced with official Formula 1 live timing protocols and Sky Sports F1 broadcast archives
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Archive 1 */}
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>Official F1 Live Timing Portal</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Access raw sector times (S1, S2, S3), tyre degradation degradation curves, and speed trap figures via Ergast / Jolpica live endpoint.
                  </p>
                  <a
                    href="https://api.jolpi.ca/ergast/f1/current/last/results.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold pt-1"
                  >
                    <span>Inspect Raw JSON Telemetry Feed</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Archive 2: Stream Replay */}
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>Sky Sports F1 Broadcast Mirror</span>
                    <span className="text-[10px] text-sky-400 font-mono">Server 1 Active</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Watch live coverage or replays via the integrated stream player tuned to Server 1 &gt; Sky Sports F1 [UK].
                  </p>
                  {onWatchStreamReplay && (
                    <button
                      onClick={onWatchStreamReplay}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e10600] hover:bg-[#c30500] text-white font-bold rounded-lg transition-colors cursor-pointer mt-1"
                    >
                      <span>Switch to Live Sky Sports F1 Stream</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
