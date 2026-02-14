import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import { readLiveMatch } from '../../lib/live-match-store';
import { readLiveOverrides } from '../../lib/live-overrides-store';
import { defaultFanZonePoll, readFanZonePoll } from '../../lib/fan-zone-poll-store';
import { readFanWall } from '../../lib/fan-wall-store';

export const dynamic = 'force-dynamic';

type LineupPlayer = { name: string; image?: string };

const statRows = [
  { key: 'possession', label: 'Possession', suffix: '%' },
  { key: 'shots', label: 'Tirs' },
  { key: 'shotsOnTarget', label: 'Tirs cadres' },
  { key: 'xg', label: 'xG' },
  { key: 'passes', label: 'Passes' },
  { key: 'passAccuracy', label: 'Precision des passes', suffix: '%' },
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

const eventLabel = (type: string) => {
  switch (type) {
    case 'goal':
      return 'BUT';
    case 'card':
      return 'CARTON';
    case 'substitution':
      return 'CHANGEMENT';
    case 'chance':
      return 'OCCASION';
    default:
      return type.toUpperCase();
  }
};

export default async function LiveMatchPage() {
  const liveMatch = await readLiveMatch();
  const liveOverrides = await readLiveOverrides();
  const poll = (await readFanZonePoll()) ?? defaultFanZonePoll;
  const liveComments = (await readFanWall()).filter((post) => post.approved).slice(0, 8);
  const pollOptions = Array.isArray(poll.options) ? poll.options.slice(0, 3) : [];
  while (pollOptions.length < 3) {
    pollOptions.push({ label: `Option ${pollOptions.length + 1}`, votes: 0 });
  }

  if (!liveMatch) {
    return (
      <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center text-gray-300">
          <h1 className="text-3xl font-bold text-white mb-4">Centre du match en direct</h1>
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

  const overrideDetails = Array.isArray(liveOverrides?.startersHomeDetails)
    ? liveOverrides?.startersHomeDetails
    : [];
  const overrideNames = Array.isArray(liveOverrides?.startersHome)
    ? liveOverrides?.startersHome
    : [];
  const starters = hasOverrides
    ? overrideDetails.length > 0
      ? overrideDetails
      : overrideNames.map((name) => ({ name }))
    : Array.isArray(liveMatch.lineups?.home)
      ? liveMatch.lineups.home.map((name) => ({ name }))
      : [];
  const bench = hasOverrides
    ? Array.isArray(liveOverrides?.benchHome)
      ? liveOverrides!.benchHome
      : []
    : [];
  const formation = hasOverrides ? liveOverrides!.formation : '4-3-3';
  const normalizedFormation = formation.includes('-')
    ? formation
    : (() => {
        const digits = formation.match(/\d/g) ?? [];
        return digits.length >= 3 ? digits.join('-') : formation;
      })();

  const buildLineup = (players: LineupPlayer[], shape: string) => {
    if (players.length === 0) return { gk: { name: '' }, lines: [] as LineupPlayer[][] };
    const gk = players[0] ?? { name: '' };
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

  const lineup = buildLineup(starters, normalizedFormation);
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
              DIRECT {minute}&apos; {period}
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Centre du match en direct</h1>
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
          <ScaleIn delay={0.28} className="lg:col-span-3">
            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-3xl font-semibold text-white">Onze de depart</h3>
                <div className="text-sm text-gray-300">
                  {home.name} · Formation {normalizedFormation}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-4 overflow-hidden">
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#15543a] to-[#0a2419] p-6 sm:p-8">
                    <div className="absolute inset-4 rounded-xl border border-white/10" />
                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
                    <div className="relative space-y-7">
                      {displayLines.map((line, lineIndex) => (
                        <div
                          key={`line-${lineIndex}`}
                          className="grid gap-3 sm:gap-4"
                          style={{ gridTemplateColumns: `repeat(${Math.max(line.length, 1)}, minmax(0, 1fr))` }}
                        >
                          {line.map((player) => {
                            const initials = player.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part.charAt(0))
                              .join('');
                            return (
                              <div key={`${player.name}-${lineIndex}`} className="flex flex-col items-center">
                                <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-white/20 bg-white/10 shadow-sm">
                                  {player.image ? (
                                    <img
                                      src={player.image}
                                      alt={player.name}
                                      className="absolute inset-0 h-full w-full rounded-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                                      {initials || 'PSG'}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 text-[11px] sm:text-xs text-gray-100 text-center leading-tight line-clamp-2">
                                  {player.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {lineup.gk?.name && (
                        <div className="flex justify-center">
                          <div className="flex w-24 flex-col items-center">
                            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-red-400/40 bg-red-500/20 shadow-sm">
                              {lineup.gk.image ? (
                                <img
                                  src={lineup.gk.image}
                                  alt={lineup.gk.name}
                                  className="absolute inset-0 h-full w-full rounded-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-red-100">
                                  {lineup.gk.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((part) => part.charAt(0))
                                    .join('') || 'GK'}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-[11px] sm:text-xs text-red-100 text-center leading-tight line-clamp-2">
                              {lineup.gk.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">Moment du match</p>
                    <p className="text-lg font-semibold text-white">{safeMoment.title}</p>
                    <p className="text-sm text-gray-300 mt-2">{safeMoment.description}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">Prochain match</p>
                    <p className="text-white font-semibold">PSG - {safeNextMatch.opponent}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(safeNextMatch.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {safeNextMatch.venue}
                    </p>
                  </div>
                  {bench.length > 0 && (
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-300 mb-2">Remplacants</p>
                      <p className="text-sm text-gray-300">{bench.join(' · ')}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Sondage supporters</h3>
                    <p className="text-gray-300 mb-4 text-sm">{poll.question}</p>
                    <div className="space-y-2">
                      {pollOptions.map((option) => (
                        <button
                          key={option.label}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-left text-white hover:bg-white/20 transition-colors"
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleIn>

          <ScaleIn delay={0.3} className="lg:col-span-1">
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

          <ScaleIn delay={0.35} className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Fil du match</h3>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                {safeEvents.map((event) => (
                  <div key={`${event.minute}-${event.player}`} className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
                    <div className="text-lg font-semibold text-white w-12 text-center">{event.minute}&apos;</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eventBadge(event.type)}`}>
                          {eventLabel(event.type)}
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
        </div>

        <ScaleIn delay={0.42}>
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-2xl font-semibold text-white">Commentaires en direct</h3>
              <a
                href="/fan-zone"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Ecrire un commentaire
              </a>
            </div>
            {liveComments.length === 0 ? (
              <p className="text-gray-300">Aucun commentaire valide pour le moment.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {liveComments.map((post) => (
                  <div key={post.id} className="rounded-xl bg-white/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white font-semibold">{post.name}</p>
                      <span className="text-xs text-gray-300">{post.time || 'Live'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-200">{post.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScaleIn>
      </div>
    </div>
  );
}
