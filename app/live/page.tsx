import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import { readLiveMatch } from '../../lib/live-match-store';
import { readLiveOverrides } from '../../lib/live-overrides-store';

export const dynamic = 'force-dynamic';

const statRows = [
  { key: 'possession', label: 'Possession', suffix: '%' },
  { key: 'shots', label: 'Tirs' },
  { key: 'shotsOnTarget', label: 'Tirs cadres' },
  { key: 'xg', label: 'xG' },
  { key: 'passes', label: 'Passes' },
  { key: 'passAccuracy', label: 'Precision passes', suffix: '%' },
  { key: 'corners', label: 'Corners' },
  { key: 'offsides', label: 'Hors-jeu' },
  { key: 'fouls', label: 'Fautes' },
];

const eventBadge = (type: string) => {
  switch (type) {
    case 'goal':
      return 'bg-red-500/20 text-red-200';
    case 'card':
      return 'bg-yellow-400/20 text-yellow-200';
    case 'substitution':
      return 'bg-blue-400/20 text-blue-200';
    default:
      return 'bg-white/10 text-gray-200';
  }
};

export default async function LiveMatchPage() {
  const liveMatch = await readLiveMatch();
  const liveOverrides = await readLiveOverrides();

  if (!liveMatch) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center text-gray-300">
          <h1 className="text-3xl font-bold text-white mb-4">Live Match Center</h1>
          <p>Aucune donnee live disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  const hasOverrides = !!(
    liveOverrides &&
    (liveOverrides.startersHome.length > 0 ||
      liveOverrides.benchHome.length > 0 ||
      liveOverrides.awayName ||
      liveOverrides.competition ||
      liveOverrides.stadium ||
      liveOverrides.referee ||
      liveOverrides.kickoff ||
      liveOverrides.homeScore !== 0 ||
      liveOverrides.awayScore !== 0)
  );

  const status = hasOverrides ? liveOverrides!.status : liveMatch.status;
  const minute = hasOverrides ? liveOverrides!.minute : liveMatch.minute;
  const period = hasOverrides ? liveOverrides!.period : liveMatch.period;
  const competition = hasOverrides ? liveOverrides!.competition || liveMatch.competition : liveMatch.competition;
  const stadium = hasOverrides ? liveOverrides!.stadium || liveMatch.stadium : liveMatch.stadium;
  const referee = hasOverrides ? liveOverrides!.referee || liveMatch.referee : liveMatch.referee;
  const kickoff = hasOverrides ? liveOverrides!.kickoff || liveMatch.kickoff : liveMatch.kickoff;
  const home = hasOverrides
    ? { ...liveMatch.home, name: liveOverrides!.homeName || liveMatch.home.name, score: liveOverrides!.homeScore }
    : liveMatch.home;
  const away = hasOverrides
    ? { ...liveMatch.away, name: liveOverrides!.awayName || liveMatch.away.name, score: liveOverrides!.awayScore }
    : liveMatch.away;

  const starters = hasOverrides
    ? liveOverrides!.startersHome
    : Array.isArray(liveMatch.lineups?.home)
      ? liveMatch.lineups.home
      : [];
  const bench = hasOverrides ? liveOverrides!.benchHome : [];
  const formation = hasOverrides ? liveOverrides!.formation : '4-3-3';

  const buildLineup = (players: string[], shape: string) => {
    if (players.length === 0) return { gk: '', lines: [] as string[][] };
    const gk = players[0] ?? '';
    const parts = shape
      .split('-')
      .map((part) => Number(part))
      .filter((num) => Number.isFinite(num) && num > 0);
    let cursor = 1;
    const lines = parts.map((count) => {
      const line = players.slice(cursor, cursor + count);
      cursor += count;
      return line;
    });
    return { gk, lines };
  };

  const lineup = buildLineup(starters, formation);
  const displayLines = [...lineup.lines].reverse();
  const safeEvents = Array.isArray(liveMatch.events) ? liveMatch.events : [];
  const safeMoment = liveMatch.moment ?? { title: 'Moment du match', description: '' };
  const safeNextMatch =
    liveMatch.nextMatch ?? { competition: 'Ligue 1', opponent: 'Adversaire', date: new Date().toISOString(), venue: '' };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <FadeIn delay={0.1}>
          <div className="text-center space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold text-red-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-400 matchday-blink" />
              LIVE {minute}&apos; {period}
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Live Match Center</h1>
            <p className="text-gray-300">
              {competition} · {stadium} · Arbitre {referee}
            </p>
          </div>
        </FadeIn>

        <ScaleIn delay={0.2}>
          <div className="glass matchday-glow matchday-sweep rounded-2xl p-8">
            <div className="grid gap-8 md:grid-cols-3 md:items-center">
              <div className="text-center">
                <p className="text-sm text-gray-300">Domicile</p>
                <h2 className="text-2xl font-semibold text-white">{home.name}</h2>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-white matchday-float">
                  {home.score} - {away.score}
                </div>
                <div className="text-sm text-gray-300">
                  Coup d&apos;envoi {new Date(kickoff).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">Exterieur</p>
                <h2 className="text-2xl font-semibold text-white">{away.name}</h2>
              </div>
            </div>
          </div>
        </ScaleIn>

        <div className="grid gap-8 lg:grid-cols-3">
          <ScaleIn delay={0.3} className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Stats du match</h3>
              <div className="space-y-4">
                {statRows.map((stat) => {
                  const homeValue = home[stat.key as keyof typeof home];
                  const awayValue = away[stat.key as keyof typeof away];
                  const total = Number(homeValue) + Number(awayValue);
                  const homePercent = total > 0 ? (Number(homeValue) / total) * 100 : 50;
                  return (
                    <div key={stat.key}>
                      <div className="flex items-center justify-between text-sm text-gray-200 mb-2">
                        <span>{stat.label}</span>
                        <span>
                          {homeValue}
                          {stat.suffix || ''} - {awayValue}
                          {stat.suffix || ''}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${homePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScaleIn>

          <ScaleIn delay={0.35}>
            <div className="glass rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{safeMoment.title}</h3>
                <p className="text-gray-300">{safeMoment.description}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Prochain match</h4>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-gray-300">{safeNextMatch.competition}</p>
                  <p className="text-lg text-white font-semibold">PSG vs {safeNextMatch.opponent}</p>
                  <p className="text-sm text-gray-300">
                    {new Date(safeNextMatch.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {safeNextMatch.venue}
                  </p>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <ScaleIn delay={0.4} className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Timeline Live</h3>
              <div className="space-y-4">
                {safeEvents.map((event) => (
                  <div key={`${event.minute}-${event.player}`} className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
                    <div className="text-lg font-semibold text-white w-12 text-center">{event.minute}&apos;</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eventBadge(event.type)}`}>
                          {event.type.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">{event.player}</span>
                        <span className="text-sm text-gray-300">({event.team})</span>
                      </div>
                      <p className="text-gray-300 mt-2">{event.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScaleIn>

          <ScaleIn delay={0.45}>
            <div className="glass rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Onze de depart</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-300">
                    {home.name} · Formation {formation}
                  </div>
                  <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-4">
                    <div className="relative rounded-xl bg-gradient-to-b from-[#10263d] to-[#0a1426] p-4">
                      <div className="absolute inset-0 rounded-xl border border-white/5" />
                      <div className="relative space-y-4">
                        {displayLines.map((line, lineIndex) => (
                          <div key={`line-${lineIndex}`} className="flex justify-evenly gap-2">
                            {line.map((player) => (
                              <div
                                key={player}
                                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white shadow-sm"
                              >
                                {player}
                              </div>
                            ))}
                          </div>
                        ))}
                        {lineup.gk && (
                          <div className="flex justify-center">
                            <div className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200 shadow-sm">
                              {lineup.gk}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {bench.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Remplacants</p>
                      <p className="text-sm text-gray-400">{bench.join(' · ')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Fan Pulse</h3>
                <p className="text-gray-300 mb-4">Qui est le joueur du match pour l&apos;instant ?</p>
                <div className="space-y-2">
                  {['Mbappe', 'Dembele', 'Vitinha'].map((player) => (
                    <button
                      key={player}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-left text-white hover:bg-white/20 transition-colors"
                      type="button"
                    >
                      {player}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </div>
    </div>
  );
}
