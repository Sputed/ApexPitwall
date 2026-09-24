import {
  OpenF1CarData,
  OpenF1DriverProfile,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Pit,
  OpenF1Radio,
  OpenF1Session,
  OpenF1Stint,
} from '../types/f1';

const BASE_OPENF1_URL = 'https://api.openf1.org/v1';

export const OPENF1_SAMPLE_DRIVERS: OpenF1DriverProfile[] = [
  {
    broadcast_name: 'L NORRIS',
    country_code: 'GBR',
    driver_number: 4,
    first_name: 'Lando',
    full_name: 'Lando NORRIS',
    last_name: 'Norris',
    meeting_key: 1245,
    name_acronym: 'NOR',
    session_key: 9632,
    team_colour: 'FF8000',
    team_name: 'McLaren',
  },
  {
    broadcast_name: 'O PIASTRI',
    country_code: 'AUS',
    driver_number: 81,
    first_name: 'Oscar',
    full_name: 'Oscar PIASTRI',
    last_name: 'Piastri',
    meeting_key: 1245,
    name_acronym: 'PIA',
    session_key: 9632,
    team_colour: 'FF8000',
    team_name: 'McLaren',
  },
  {
    broadcast_name: 'C LECLERC',
    country_code: 'MON',
    driver_number: 16,
    first_name: 'Charles',
    full_name: 'Charles LECLERC',
    last_name: 'Leclerc',
    meeting_key: 1245,
    name_acronym: 'LEC',
    session_key: 9632,
    team_colour: 'E80020',
    team_name: 'Ferrari',
  },
  {
    broadcast_name: 'M VERSTAPPEN',
    country_code: 'NED',
    driver_number: 1,
    first_name: 'Max',
    full_name: 'Max VERSTAPPEN',
    last_name: 'Verstappen',
    meeting_key: 1245,
    name_acronym: 'VER',
    session_key: 9632,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'C SAINZ',
    country_code: 'ESP',
    driver_number: 55,
    first_name: 'Carlos',
    full_name: 'Carlos SAINZ',
    last_name: 'Sainz',
    meeting_key: 1245,
    name_acronym: 'SAI',
    session_key: 9632,
    team_colour: 'E80020',
    team_name: 'Ferrari',
  },
  {
    broadcast_name: 'G RUSSELL',
    country_code: 'GBR',
    driver_number: 63,
    first_name: 'George',
    full_name: 'George RUSSELL',
    last_name: 'Russell',
    meeting_key: 1245,
    name_acronym: 'RUS',
    session_key: 9632,
    team_colour: '27F4D2',
    team_name: 'Mercedes',
  },
  {
    broadcast_name: 'L HAMILTON',
    country_code: 'GBR',
    driver_number: 44,
    first_name: 'Lewis',
    full_name: 'Lewis HAMILTON',
    last_name: 'Hamilton',
    meeting_key: 1245,
    name_acronym: 'HAM',
    session_key: 9632,
    team_colour: '27F4D2',
    team_name: 'Mercedes',
  },
  {
    broadcast_name: 'S PEREZ',
    country_code: 'MEX',
    driver_number: 11,
    first_name: 'Sergio',
    full_name: 'Sergio PEREZ',
    last_name: 'Perez',
    meeting_key: 1245,
    name_acronym: 'PER',
    session_key: 9632,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'F ALONSO',
    country_code: 'ESP',
    driver_number: 14,
    first_name: 'Fernando',
    full_name: 'Fernando ALONSO',
    last_name: 'Alonso',
    meeting_key: 1245,
    name_acronym: 'ALO',
    session_key: 9632,
    team_colour: '229971',
    team_name: 'Aston Martin',
  },
  {
    broadcast_name: 'L STROLL',
    country_code: 'CAN',
    driver_number: 18,
    first_name: 'Lance',
    full_name: 'Lance STROLL',
    last_name: 'Stroll',
    meeting_key: 1245,
    name_acronym: 'STR',
    session_key: 9632,
    team_colour: '229971',
    team_name: 'Aston Martin',
  },
  {
    broadcast_name: 'Y TSUNODA',
    country_code: 'JPN',
    driver_number: 22,
    first_name: 'Yuki',
    full_name: 'Yuki TSUNODA',
    last_name: 'Tsunoda',
    meeting_key: 1245,
    name_acronym: 'TSU',
    session_key: 9632,
    team_colour: '6692FF',
    team_name: 'RB',
  },
  {
    broadcast_name: 'D RICCIARDO',
    country_code: 'AUS',
    driver_number: 3,
    first_name: 'Daniel',
    full_name: 'Daniel RICCIARDO',
    last_name: 'Ricciardo',
    meeting_key: 1245,
    name_acronym: 'RIC',
    session_key: 9632,
    team_colour: '6692FF',
    team_name: 'RB',
  },
  {
    broadcast_name: 'A ALBON',
    country_code: 'THA',
    driver_number: 23,
    first_name: 'Alexander',
    full_name: 'Alexander ALBON',
    last_name: 'Albon',
    meeting_key: 1245,
    name_acronym: 'ALB',
    session_key: 9632,
    team_colour: '64C4FF',
    team_name: 'Williams',
  },
  {
    broadcast_name: 'F COLAPINTO',
    country_code: 'ARG',
    driver_number: 43,
    first_name: 'Franco',
    full_name: 'Franco COLAPINTO',
    last_name: 'Colapinto',
    meeting_key: 1245,
    name_acronym: 'COL',
    session_key: 9632,
    team_colour: '64C4FF',
    team_name: 'Williams',
  },
  {
    broadcast_name: 'N HULKENBERG',
    country_code: 'GER',
    driver_number: 27,
    first_name: 'Nico',
    full_name: 'Nico HULKENBERG',
    last_name: 'Hulkenberg',
    meeting_key: 1245,
    name_acronym: 'HUL',
    session_key: 9632,
    team_colour: 'B6BABD',
    team_name: 'Haas F1 Team',
  },
  {
    broadcast_name: 'K MAGNUSSEN',
    country_code: 'DEN',
    driver_number: 20,
    first_name: 'Kevin',
    full_name: 'Kevin MAGNUSSEN',
    last_name: 'Magnussen',
    meeting_key: 1245,
    name_acronym: 'MAG',
    session_key: 9632,
    team_colour: 'B6BABD',
    team_name: 'Haas F1 Team',
  },
  {
    broadcast_name: 'P GASLY',
    country_code: 'FRA',
    driver_number: 10,
    first_name: 'Pierre',
    full_name: 'Pierre GASLY',
    last_name: 'Gasly',
    meeting_key: 1245,
    name_acronym: 'GAS',
    session_key: 9632,
    team_colour: '0093CC',
    team_name: 'Alpine',
  },
  {
    broadcast_name: 'E OCON',
    country_code: 'FRA',
    driver_number: 31,
    first_name: 'Esteban',
    full_name: 'Esteban OCON',
    last_name: 'Ocon',
    meeting_key: 1245,
    name_acronym: 'OCO',
    session_key: 9632,
    team_colour: '0093CC',
    team_name: 'Alpine',
  },
  {
    broadcast_name: 'V BOTTAS',
    country_code: 'FIN',
    driver_number: 77,
    first_name: 'Valtteri',
    full_name: 'Valtteri BOTTAS',
    last_name: 'Bottas',
    meeting_key: 1245,
    name_acronym: 'BOT',
    session_key: 9632,
    team_colour: '52E252',
    team_name: 'Kick Sauber',
  },
  {
    broadcast_name: 'G ZHOU',
    country_code: 'CHN',
    driver_number: 24,
    first_name: 'Guanyu',
    full_name: 'Guanyu ZHOU',
    last_name: 'Zhou',
    meeting_key: 1245,
    name_acronym: 'ZHO',
    session_key: 9632,
    team_colour: '52E252',
    team_name: 'Kick Sauber',
  },
];

export const OPENF1_SAMPLE_RADIO: OpenF1Radio[] = [
  {
    date: '2024-09-15T12:04:18Z',
    driver_number: 4,
    session_key: 9632,
    recording_url: 'https://livetiming.formula1.com/static/2024/2024-09-15_Azerbaijan_Grand_Prix/2024-09-15_Race/TeamRadio/LANNOR01_4_20240915_120418.mp3',
    transcript: 'Lando, pace is strong. We are +0.4s to Leclerc in Sector 2. Keep tyre management in Turn 8.',
  },
  {
    date: '2024-09-15T12:12:04Z',
    driver_number: 16,
    session_key: 9632,
    recording_url: 'https://livetiming.formula1.com/static/2024/2024-09-15_Azerbaijan_Grand_Prix/2024-09-15_Race/TeamRadio/CHALEC01_16_20240915_121204.mp3',
    transcript: 'Rear tyres are beginning to drop off. Understeer in low speed corners.',
  },
  {
    date: '2024-09-15T12:18:33Z',
    driver_number: 1,
    session_key: 9632,
    recording_url: 'https://livetiming.formula1.com/static/2024/2024-09-15_Azerbaijan_Grand_Prix/2024-09-15_Race/TeamRadio/MAXVER01_1_20240915_121833.mp3',
    transcript: 'No bite on the front brakes into Turn 1, car is jumping around on kerbs.',
  },
  {
    date: '2024-09-15T12:25:50Z',
    driver_number: 81,
    session_key: 9632,
    recording_url: 'https://livetiming.formula1.com/static/2024/2024-09-15_Azerbaijan_Grand_Prix/2024-09-15_Race/TeamRadio/OSCPIA01_81_20240915_122550.mp3',
    transcript: 'Box now, box for Hards. Watch pit exit line.',
  },
];

export const OPENF1_SAMPLE_PITS: OpenF1Pit[] = [
  {
    date: '2024-09-15T12:21:40Z',
    driver_number: 81,
    lap_number: 16,
    pit_duration: 2.2,
    session_key: 9632,
  },
  {
    date: '2024-09-15T12:23:12Z',
    driver_number: 16,
    lap_number: 17,
    pit_duration: 2.4,
    session_key: 9632,
  },
  {
    date: '2024-09-15T12:24:55Z',
    driver_number: 1,
    lap_number: 18,
    pit_duration: 2.7,
    session_key: 9632,
  },
  {
    date: '2024-09-15T12:26:10Z',
    driver_number: 44,
    lap_number: 19,
    pit_duration: 2.3,
    session_key: 9632,
  },
];

export async function fetchOpenF1Sessions(): Promise<OpenF1Session[]> {
  try {
    const res = await fetch(`${BASE_OPENF1_URL}/sessions?year=2024&session_name=Race`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`OpenF1 status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('OpenF1 sessions API fallback:', err);
  }

  return [
    {
      circuit_key: 63,
      circuit_short_name: 'Baku',
      country_code: 'AZE',
      country_key: 17,
      country_name: 'Azerbaijan',
      date_end: '2024-09-15T13:00:00+04:00',
      date_start: '2024-09-15T11:00:00+04:00',
      gmt_offset: '+04:00',
      location: 'Baku',
      meeting_key: 1245,
      session_key: 9632,
      session_name: 'Race',
      session_type: 'Race',
      year: 2024,
    },
  ];
}

export async function fetchOpenF1CarData(
  driverNumber: number = 4,
  sessionKey: number = 9632
): Promise<OpenF1CarData[]> {
  try {
    const res = await fetch(
      `${BASE_OPENF1_URL}/car_data?driver_number=${driverNumber}&session_key=${sessionKey}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error(`OpenF1 car_data status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(-30);
    }
  } catch (err) {
    console.warn('OpenF1 car_data API fallback:', err);
  }

  // Synthesize realistic OpenF1 Baku high-speed telemetry sequence
  const result: OpenF1CarData[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < 20; i++) {
    const progress = i / 20;
    const speed = Math.round(280 + Math.sin(progress * Math.PI) * 65);
    const rpm = Math.round(speed > 300 ? 11600 + Math.random() * 300 : 9200 + (speed % 50) * 45);
    const gear = speed > 310 ? 8 : speed > 270 ? 7 : 6;
    const throttle = speed > 290 ? 100 : 95;
    const brake = 0;
    const drs = speed > 300 ? 1 : 0;

    result.push({
      brake,
      date: new Date(baseTime - (20 - i) * 300).toISOString(),
      driver_number: driverNumber,
      drs,
      meeting_key: 1245,
      n_gear: gear,
      rpm,
      session_key: sessionKey,
      speed,
      throttle,
    });
  }

  return result;
}

export async function fetchOpenF1Intervals(sessionKey: number = 9632): Promise<OpenF1Interval[]> {
  try {
    const res = await fetch(`${BASE_OPENF1_URL}/intervals?session_key=${sessionKey}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`OpenF1 intervals status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(-10);
    }
  } catch (err) {
    console.warn('OpenF1 intervals fallback:', err);
  }

  return [
    { date: new Date().toISOString(), driver_number: 81, gap_to_leader: 'LEADER', interval: 'LEADER', session_key: sessionKey },
    { date: new Date().toISOString(), driver_number: 16, gap_to_leader: '+1.412', interval: '+1.412', session_key: sessionKey },
    { date: new Date().toISOString(), driver_number: 4, gap_to_leader: '+4.890', interval: '+3.478', session_key: sessionKey },
    { date: new Date().toISOString(), driver_number: 55, gap_to_leader: '+7.112', interval: '+2.222', session_key: sessionKey },
    { date: new Date().toISOString(), driver_number: 1, gap_to_leader: '+11.450', interval: '+4.338', session_key: sessionKey },
    { date: new Date().toISOString(), driver_number: 63, gap_to_leader: '+14.280', interval: '+2.830', session_key: sessionKey },
  ];
}

export async function fetchOpenF1TeamRadio(sessionKey: number = 9632): Promise<OpenF1Radio[]> {
  try {
    const res = await fetch(`${BASE_OPENF1_URL}/team_radio?session_key=${sessionKey}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`OpenF1 team_radio status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(-8);
    }
  } catch (err) {
    console.warn('OpenF1 team_radio fallback:', err);
  }

  return OPENF1_SAMPLE_RADIO;
}

export const OPENF1_SAMPLE_STINTS: OpenF1Stint[] = [
  { compound: 'MEDIUM', driver_number: 81, lap_start: 1, lap_end: 16, meeting_key: 1245, session_key: 9632, stint_number: 1, tyre_age_at_start: 0 },
  { compound: 'HARD', driver_number: 81, lap_start: 17, lap_end: 51, meeting_key: 1245, session_key: 9632, stint_number: 2, tyre_age_at_start: 0 },
  { compound: 'MEDIUM', driver_number: 16, lap_start: 1, lap_end: 17, meeting_key: 1245, session_key: 9632, stint_number: 1, tyre_age_at_start: 0 },
  { compound: 'HARD', driver_number: 16, lap_start: 18, lap_end: 51, meeting_key: 1245, session_key: 9632, stint_number: 2, tyre_age_at_start: 0 },
  { compound: 'HARD', driver_number: 4, lap_start: 1, lap_end: 37, meeting_key: 1245, session_key: 9632, stint_number: 1, tyre_age_at_start: 0 },
  { compound: 'MEDIUM', driver_number: 4, lap_start: 38, lap_end: 51, meeting_key: 1245, session_key: 9632, stint_number: 2, tyre_age_at_start: 0 },
  { compound: 'MEDIUM', driver_number: 1, lap_start: 1, lap_end: 18, meeting_key: 1245, session_key: 9632, stint_number: 1, tyre_age_at_start: 0 },
  { compound: 'HARD', driver_number: 1, lap_start: 19, lap_end: 51, meeting_key: 1245, session_key: 9632, stint_number: 2, tyre_age_at_start: 0 },
];

export async function fetchOpenF1Stints(sessionKey: number = 9632): Promise<OpenF1Stint[]> {
  try {
    const res = await fetch(`${BASE_OPENF1_URL}/stints?session_key=${sessionKey}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`OpenF1 stints status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('OpenF1 stints fallback:', err);
  }

  return OPENF1_SAMPLE_STINTS;
}

export async function fetchOpenF1Laps(sessionKey: number = 9632, driverNumber?: number): Promise<OpenF1Lap[]> {
  try {
    const url = driverNumber
      ? `${BASE_OPENF1_URL}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
      : `${BASE_OPENF1_URL}/laps?session_key=${sessionKey}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`OpenF1 laps status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(-20);
    }
  } catch (err) {
    console.warn('OpenF1 laps fallback:', err);
  }

  return [];
}

