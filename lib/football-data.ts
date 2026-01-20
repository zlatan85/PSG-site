import type { MatchEntry } from './matches-store';

type FootballDataMatch = {
  id?: number;
  utcDate?: string;
  status?: string;
  competition?: { name?: string };
  homeTeam?: { id?: number; name?: string };
  awayTeam?: { id?: number; name?: string };
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
  };
  venue?: string | null;
};

const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';

const parseMatchDate = (utcDate?: string) => {
  if (!utcDate) {
    return { date: '', time: '' };
  }
  const parsed = new Date(utcDate);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }
  const iso = parsed.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
};

const normalizeStatus = (status?: string): MatchEntry['status'] => {
  const normalized = (status ?? '').toUpperCase();
  if (normalized === 'FINISHED' || normalized === 'AWARDED') {
    return 'played';
  }
  if (normalized === 'SCHEDULED' || normalized === 'TIMED' || normalized === 'POSTPONED') {
    return 'upcoming';
  }
  return 'upcoming';
};

const computeResult = (
  match: FootballDataMatch,
  teamId: number,
): MatchEntry['result'] | undefined => {
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
    return undefined;
  }
  const isHome = match.homeTeam?.id === teamId;
  if (homeScore === awayScore) {
    return 'D';
  }
  if ((homeScore > awayScore && isHome) || (awayScore > homeScore && !isHome)) {
    return 'W';
  }
  return 'L';
};

export async function fetchFootballDataMatches(): Promise<MatchEntry[] | null> {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALL_DATA_KEY;
  if (!token) {
    return null;
  }
  const teamId = Number(process.env.FOOTBALL_DATA_TEAM_ID ?? 524);
  const url = `${FOOTBALL_DATA_BASE_URL}/teams/${teamId}/matches?competitions=FL1,CL&limit=50`;

  const response = await fetch(url, {
    headers: { 'X-Auth-Token': token },
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { matches?: FootballDataMatch[] };
  if (!Array.isArray(data.matches)) {
    return null;
  }

  return data.matches
    .map((match) => {
      const { date, time } = parseMatchDate(match.utcDate);
      const homeScore = match.score?.fullTime?.home;
      const awayScore = match.score?.fullTime?.away;
      const score =
        typeof homeScore === 'number' && typeof awayScore === 'number'
          ? `${homeScore}-${awayScore}`
          : undefined;
      const status = normalizeStatus(match.status);

      return {
        id: typeof match.id === 'number' ? match.id : Math.floor(Math.random() * 1_000_000),
        date,
        time,
        home: match.homeTeam?.name ?? 'PSG',
        away: match.awayTeam?.name ?? 'Adversaire',
        competition: match.competition?.name ?? 'Competition',
        stadium: match.venue ?? 'A confirmer',
        status,
        score,
        result: status === 'played' ? computeResult(match, teamId) : undefined,
      };
    })
    .filter((match) => match.date && match.time && match.home && match.away);
}
