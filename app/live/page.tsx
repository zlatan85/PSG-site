import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import { readLiveMatch } from '../../lib/live-match-store';

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

  const { home, away } = liveMatch;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <FadeIn delay={0.1}>
          <div className="text-center space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold text-red-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-400 matchday-blink" />
              LIVE {liveMatch.minute}&apos; {liveMatch.period}
            </p>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Live Match Center</h1>
            <p className="text-gray-300">
              {liveMatch.competition} · {liveMatch.stadium} · Arbitre {liveMatch.referee}
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
                  Coup d&apos;envoi {new Date(liveMatch.kickoff).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                <h3 className="text-xl font-semibold text-white mb-3">{liveMatch.moment.title}</h3>
                <p className="text-gray-300">{liveMatch.moment.description}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Prochain match</h4>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-gray-300">{liveMatch.nextMatch.competition}</p>
                  <p className="text-lg text-white font-semibold">PSG vs {liveMatch.nextMatch.opponent}</p>
                  <p className="text-sm text-gray-300">
                    {new Date(liveMatch.nextMatch.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {liveMatch.nextMatch.venue}
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
                {liveMatch.events.map((event) => (
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
                <h3 className="text-xl font-semibold text-white mb-4">Compos probables</h3>
                <div className="space-y-4 text-sm text-gray-200">
                  <div>
                    <p className="text-white font-semibold mb-2">{home.name}</p>
                    <p className="text-gray-300">{liveMatch.lineups.home.join(' · ')}</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2">{away.name}</p>
                    <p className="text-gray-300">{liveMatch.lineups.away.join(' · ')}</p>
                  </div>
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
