import { DriverTiming, GrandPrixEvent, RaceControlMessage, WeatherData } from '../types/f1';
import { INITIAL_DRIVERS } from '../data/telemetryData';

export interface LiveF1State {
  event: GrandPrixEvent;
  drivers: DriverTiming[];
  weather: WeatherData;
  messages: RaceControlMessage[];
  lastUpdated: string;
  source: 'ESPN_OFFICIAL_FEED' | 'JOLPICA_ERGAST_F1' | 'SIMULATED_LIVE_TELEMETRY';
}

export async function fetchLiveScoreboard(): Promise<{ event?: GrandPrixEvent; drivers?: DriverTiming[] }> {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard');
    if (!res.ok) throw new Error(`Scoreboard HTTP ${res.status}`);
    const data = await res.json();

    if (data.events && data.events.length > 0) {
      const evt = data.events[0];
      const comp = evt.competitions?.[0];
      const gpEvent: GrandPrixEvent = {
        id: evt.id || '600057444',
        name: evt.name || 'Qatar Airways Azerbaijan Grand Prix',
        round: 17,
        season: String(evt.season?.year || '2026'),
        circuitName: 'Baku City Circuit',
        country: 'Azerbaijan',
        date: evt.date || new Date().toISOString(),
        sessionType: comp?.type?.abbreviation || 'FP1',
        isLive: true,
        totalLaps: 51,
        currentLap: 18,
      };

      return { event: gpEvent };
    }
  } catch (err) {
    console.warn('Failed to fetch live ESPN scoreboard:', err);
  }
  return {};
}

export async function fetchOfficialJolpicaResults(): Promise<Partial<DriverTiming>[]> {
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json');
    if (!res.ok) throw new Error(`Jolpica HTTP ${res.status}`);
    const data = await res.json();
    const results = data.MRData?.RaceTable?.Races?.[0]?.Results;
    if (Array.isArray(results) && results.length > 0) {
      return results.map((r: any) => ({
        position: Number(r.position) || 1,
        driverNumber: Number(r.number) || 1,
        driverCode: r.Driver?.code || 'F1',
        driverName: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim(),
        teamName: r.Constructor?.name || 'F1 Team',
        bestLapTime: r.FastestLap?.Time?.time || '1:43.500',
        currentLapTime: r.FastestLap?.Time?.time || '1:43.500',
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch Jolpica Ergast results:', err);
  }
  return [];
}

export const INITIAL_WEATHER: WeatherData = {
  airTemp: 26.8,
  trackTemp: 39.4,
  humidity: 48,
  windSpeed: 11.2,
  windDirection: 'NW (315°)',
  rainfall: false,
  trackStatus: 'DRY',
};

export const INITIAL_RACE_MESSAGES: RaceControlMessage[] = [
  {
    id: 'rc-1',
    time: '12:04:12',
    lap: 18,
    flag: 'GREEN',
    category: 'DRS',
    message: 'DRS ENABLED IN ZONES 1 & 2',
  },
  {
    id: 'rc-2',
    time: '12:08:45',
    lap: 19,
    category: 'TRACK_LIMITS',
    message: 'CAR 4 (NOR) - LAP TIME DELETED (TURN 15 TRACK LIMITS)',
  },
  {
    id: 'rc-3',
    time: '12:12:30',
    lap: 20,
    category: 'RADIO',
    message: 'RADIO TO NORRIS: "Box opposite Verstappen, tyre delta +0.3s"',
  },
  {
    id: 'rc-4',
    time: '12:15:02',
    lap: 21,
    flag: 'YELLOW',
    category: 'FLAG',
    message: 'YELLOW FLAG SECTOR 2 - CAR 31 (OCO) REJOINING FROM RUN-OFF AT T8',
  },
  {
    id: 'rc-5',
    time: '12:16:10',
    lap: 21,
    flag: 'GREEN',
    category: 'FLAG',
    message: 'TRACK CLEAR - GREEN FLAG ALL SECTORS',
  },
];
