export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type FlagStatus = 'GREEN' | 'YELLOW' | 'VSC' | 'SC' | 'RED' | 'CHEQUERED';

export interface DriverTiming {
  position: number;
  driverNumber: number;
  driverCode: string;
  driverName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  teamName: string;
  teamColor: string;
  currentLapTime: string;
  bestLapTime: string;
  gapToLeader: string;
  intervalToAhead: string;
  sector1: { time: string; status: 'fastest' | 'personal' | 'normal' | 'yellow' };
  sector2: { time: string; status: 'fastest' | 'personal' | 'normal' | 'yellow' };
  sector3: { time: string; status: 'fastest' | 'personal' | 'normal' | 'yellow' };
  speedTrap: number; // km/h
  tyreCompound: TyreCompound;
  tyreAgeLaps: number;
  pitStops: number;
  inPit: boolean;
  drsActive: boolean;
  lapDistanceProgress: number; // 0 to 1
  currentSpeed: number;
  currentGear: number;
  currentRpm: number;
  currentThrottle: number; // 0 - 100
  currentBrake: number; // 0 - 100
  gForceLat: number;
  gForceLong: number;
}

export interface TelemetryPoint {
  distance: number; // meters from start line (0 to ~6003)
  speed: number; // km/h
  throttle: number; // 0 - 100%
  brake: number; // 0 - 100%
  gear: number; // 1 - 8
  rpm: number; // 0 - 12500
  drs: boolean;
  time: number; // seconds
}

export interface DriverTelemetryTrace {
  driverCode: string;
  driverName: string;
  teamColor: string;
  bestLapTime: string;
  points: TelemetryPoint[];
}

export interface RaceControlMessage {
  id: string;
  time: string;
  lap: number;
  flag?: FlagStatus;
  category: 'FLAG' | 'SAFETY_CAR' | 'TRACK_LIMITS' | 'DRS' | 'INVESTIGATION' | 'RADIO';
  message: string;
}

export interface TrackCircuit {
  id: string;
  name: string;
  location: string;
  country: string;
  circuitLengthKm: number;
  laps: number;
  lapRecord: { time: string; driver: string; year: number };
  corners: number;
  drsZones: number;
  svgPath: string; // SVG path data for circuit
  turns: { number: number; x: number; y: number; name?: string }[];
  speedTraps: { x: number; y: number; label: string }[];
}

export interface WeatherData {
  airTemp: number; // Celsius
  trackTemp: number; // Celsius
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  rainfall: boolean;
  trackStatus: 'DRY' | 'DAMP' | 'WET';
}

export interface GrandPrixEvent {
  id: string;
  name: string;
  round: number;
  season: string;
  circuitName: string;
  country: string;
  date: string;
  sessionType: 'FP1' | 'FP2' | 'FP3' | 'QUALIFYING' | 'SPRINT' | 'RACE';
  isLive: boolean;
  totalLaps: number;
  currentLap: number;
}

// Race Alert System Types
export type RaceAlertType =
  | 'OVERTAKE'
  | 'PIT_STOP'
  | 'SAFETY_CAR'
  | 'LEADER_CHANGE'
  | 'FAVORITE_TOP_3'
  | 'FASTEST_LAP';

export interface RaceAlert {
  id: string;
  timestamp: string;
  lap: number;
  type: RaceAlertType;
  title: string;
  message: string;
  driverCode?: string;
  teamColor?: string;
  read?: boolean;
}

export interface RaceAlertConfig {
  overtake: boolean;
  pitStop: boolean;
  safetyCar: boolean;
  leaderChange: boolean;
  favoriteTop3: boolean;
  fastestLap: boolean;
  favoriteDriverCode: string;
  soundEnabled: boolean;
  browserNotifications: boolean;
}

// Historical Data Analysis Types
export interface HistoricalRace {
  season: string;
  round: string;
  raceName: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time?: string;
  url: string;
}

export interface HistoricalResult {
  position: number;
  number: string;
  driverId: string;
  driverCode: string;
  driverName: string;
  nationality: string;
  teamName: string;
  grid: number;
  laps: number;
  status: string;
  time?: string;
  points: number;
  fastestLap?: {
    lap: number;
    time: string;
    avgSpeedKmh?: string;
  };
}

export interface HistoricalPitStop {
  driverId: string;
  driverCode?: string;
  driverName?: string;
  stop: number;
  lap: number;
  time: string;
  duration: string;
}

export interface HistoricalDriverStanding {
  position: number;
  points: number;
  wins: number;
  driverId: string;
  driverCode: string;
  driverName: string;
  nationality: string;
  teamName: string;
}

export interface HistoricalConstructorStanding {
  position: number;
  points: number;
  wins: number;
  teamId: string;
  teamName: string;
  nationality: string;
}

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  pingMs: number;
  ip: string;
  loadPercent: number;
  protocol: 'WireGuard Turbo' | 'OpenVPN UDP' | 'IKEv2';
  optimizedFor: string;
  isUk: boolean;
}

export interface VpnState {
  isConnected: boolean;
  isConnecting: boolean;
  currentServer: VpnServer;
  bytesReceivedMb: number;
  bytesSentMb: number;
  killSwitchActive: boolean;
  dnsLeakProtection: boolean;
  protocol: 'WireGuard Turbo' | 'OpenVPN UDP' | 'IKEv2';
}

// OpenF1 Real-Time API Data Structures (https://openf1.org)
export interface OpenF1Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export interface OpenF1CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

export interface OpenF1Interval {
  date: string;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  session_key: number;
}

export interface OpenF1Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  lap_number: number;
  session_key: number;
}

export interface OpenF1Pit {
  date: string;
  driver_number: number;
  lap_number: number;
  pit_duration: number;
  session_key: number;
}

export interface OpenF1Radio {
  date: string;
  driver_number: number;
  recording_url: string;
  session_key: number;
  transcript?: string;
}

export interface OpenF1DriverProfile {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url?: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface OpenF1Stint {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;
  driver_number: number;
  lap_end?: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

