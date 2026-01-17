import Link from 'next/link';
import { FadeIn, ScaleIn } from '../components/MotionWrapper';
import { readNews } from '../lib/news-store';
import { readMatches } from '../lib/matches-store';
import { readLiveMatch } from '../lib/live-match-store';
import { readFanWall } from '../lib/fan-wall-store';
import { readSquad } from '../lib/squad-store';
import { defaultHomeSettings, readHomeSettings } from '../lib/home-settings-store';

export const dynamic = 'force-dynamic';

const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

export default async function Home() {
  const news = await readNews();
  const matches = await readMatches();
  const liveMatch = await readLiveMatch();
  const fanWallPosts = (await readFanWall()).filter((post) => post.approved);
  const squad = await readSquad();
  const homeSettings = (await readHomeSettings()) ?? defaultHomeSettings;
  const sortedNews = sortByDateDesc(news);
  const latestArticle = sortedNews[0];
  const latestNews = sortedNews.slice(0, 3);
  const recentMatches = sortByDateDesc(matches.filter((match) => match.status === 'played')).slice(0, 3);
  const upcomingMatches = sortByDateDesc(matches.filter((match) => match.status === 'upcoming')).reverse();
  const nextMatch = upcomingMatches[0];
  const nextMatchDate = nextMatch ? new Date(`${nextMatch.date}T${nextMatch.time}`) : null;
  const daysToMatch = nextMatchDate
    ? Math.max(0, Math.ceil((nextMatchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const kickoffDateLabel = nextMatchDate
    ? nextMatchDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
    : 'A venir';
  const kickoffTimeLabel = nextMatchDate
    ? nextMatchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const matchdayStatusLabel = homeSettings.matchdayStatusLabel?.trim();
  const matchdayCompetition =
    homeSettings.matchdayCompetition?.trim() || nextMatch?.competition || 'Paris Saint-Germain';
  const matchdayHome = homeSettings.matchdayHomeTeam?.trim() || nextMatch?.home || 'PSG';
  const matchdayAway = homeSettings.matchdayAwayTeam?.trim() || nextMatch?.away || 'Adversaire';
  const matchdayStadium = homeSettings.matchdayStadium?.trim() || nextMatch?.stadium || 'Parc des Princes';
  const matchdayDate = homeSettings.matchdayDate?.trim() || kickoffDateLabel;
  const matchdayTime = homeSettings.matchdayTime?.trim() || kickoffTimeLabel;
  const matchdayScore =
    homeSettings.matchdayScore?.trim() ||
    (liveMatch?.status === 'live' ? `${liveMatch.home.score} - ${liveMatch.away.score}` : '00 - 00');
  const fanWallTeaser = fanWallPosts.slice(0, 6);
  const featuredPlayer =
    squad.players.find((player) => player.group === 'forward') ?? squad.players[0];

  return (
    <div className="min-h-screen">
      {/* Hero Article */}
      <section className="relative min-h-[60vh] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.2}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <div className="absolute left-6 top-6 z-10 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {homeSettings.heroLabel}
              </div>
              {latestArticle ? (
                <>
                  <img
                    src={homeSettings.heroImage || latestArticle.image || '/api/placeholder/1600/900'}
                    alt={latestArticle.title}
                    className="h-[60vh] w-full object-cover lg:object-contain lg:bg-black/40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 mb-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1">
                        A la une
                      </span>
                      <span className="text-gray-300">{latestArticle.date}</span>
                    </div>
                    <h1 className="font-display text-5xl uppercase text-white sm:text-6xl lg:text-7xl">
                      {homeSettings.heroTitle || latestArticle.title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-gray-200 line-clamp-3">
                      {homeSettings.heroExcerpt || latestArticle.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <Link
                        href={homeSettings.heroPrimaryHref || `/news/${latestArticle.id}`}
                        className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                      >
                        {homeSettings.heroPrimaryLabel}
                      </Link>
                      <Link
                        href={homeSettings.heroSecondaryHref}
                        className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                      >
                        {homeSettings.heroSecondaryLabel}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[60vh] flex items-center justify-center text-gray-300">
                  Aucun article disponible.
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Matchday Spotlight */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.25}>
            <div className="matchday-hero rounded-3xl p-6 sm:p-8 lg:p-10">
              <div className="matchday-tape">Matchday</div>
              <div className="matchday-orb left matchday-float" />
              <div className="matchday-orb right matchday-float" />

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold text-red-200">
                      {matchdayStatusLabel ? (
                        <>{matchdayStatusLabel}</>
                      ) : liveMatch?.status === 'live' ? (
                        <>
                          <span className="inline-flex h-2 w-2 rounded-full bg-red-400 matchday-blink" />
                          LIVE EN COURS
                        </>
                      ) : (
                        <>J-{daysToMatch ?? '--'} AVANT MATCH</>
                      )}
                    </span>
                    <span className="text-gray-300">{matchdayCompetition}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{homeSettings.matchdayTitle}</h2>
                  <p className="text-gray-300 max-w-xl">{homeSettings.matchdaySubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={liveMatch?.status === 'live' ? '/live' : '/calendar'}
                      className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      {liveMatch?.status === 'live' ? 'Suivre le live' : 'Voir le calendrier'}
                    </Link>
                    <Link
                      href="/fan-zone"
                      className="rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    >
                      Fan Zone
                    </Link>
                  </div>
                </div>
                <div className="glass matchday-glow matchday-sweep rounded-2xl p-5 text-sm text-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{matchdayCompetition || 'Prochain match'}</span>
                    <span>{matchdayDate}</span>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xl font-semibold text-white">
                      {matchdayHome} vs {matchdayAway}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {matchdayTime} · {matchdayStadium}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-white matchday-float">
                        {matchdayScore}
                      </div>
                      <div className="text-xs text-gray-400">
                        {liveMatch?.status === 'live' ? `LIVE ${liveMatch.minute}'` : 'Kickoff'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Dernières Nouvelles Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.4}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Dernières Nouvelles</h2>
              <p className="mt-4 text-gray-300">Restez à jour avec les dernières nouvelles et mises à jour du PSG</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news, index) => (
              <ScaleIn key={news.id} delay={0.6 + index * 0.1}>
                <div className="glass rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                  <img
                    src={news.image || '/api/placeholder/600/400'}
                    alt={news.title}
                    className="h-32 w-full object-contain bg-black/40"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{news.title}</h3>
                    <p className="text-gray-300 mb-4 flex-1 line-clamp-3">{news.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{news.date}</span>
                      <Link href={`/news/${news.id}`} className="text-red-400 hover:text-red-300 transition-colors">
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>

          <FadeIn delay={1.2}>
            <div className="text-center mt-12">
              <Link
                href="/news"
                className="inline-block glass px-8 py-3 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Voir Toutes les Nouvelles
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Alertes Matchday */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.3}>
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">{homeSettings.alertsTitle}</h2>
                  <p className="text-gray-300 max-w-xl">{homeSettings.alertsSubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    {['Coup d\'envoi', 'Buts', 'Stats live', 'Compo officielle'].map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-white/10 px-4 py-1 text-xs text-gray-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <input
                      type="text"
                      placeholder="Numero (optionnel)"
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    Activer les alertes
                  </button>
                  <p className="mt-2 text-xs text-gray-400">
                    Inscription rapide. Tu peux te desinscrire a tout moment.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Fan Zone Teaser */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.25}>
            <div className="glass matchday-sweep rounded-3xl p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-4">
                  <p className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold text-red-200">
                    Fan Zone
                  </p>
                  <h2 className="text-3xl font-bold text-white">{homeSettings.fanZoneTitle}</h2>
                  <p className="text-gray-300 max-w-xl">{homeSettings.fanZoneSubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/fan-zone"
                      className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      Entrer dans la Fan Zone
                    </Link>
                    <Link
                      href="/live"
                      className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    >
                      Voir le live
                    </Link>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {['Fan Wall', 'Fan Pulse', 'Highlights', 'Chants'].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/5 p-4 text-sm text-gray-200">
                      <p className="font-semibold text-white">{item}</p>
                      <p className="text-gray-400 mt-1">Experience immersive & exclusive.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="mt-6 rounded-2xl bg-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Mini Fan Wall</h3>
                  <p className="text-sm text-gray-400">Les messages qui font vibrer le Parc.</p>
                </div>
                <Link
                  href="/fan-zone"
                  className="text-sm font-semibold text-red-300 hover:text-red-200 transition-colors"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="fanwall-scroll pb-2">
                <div className="fanwall-track">
                  {[...fanWallTeaser, ...fanWallTeaser].map((post, index) => (
                    <div
                      key={`${post.id}-${index}`}
                      className="min-w-[220px] rounded-xl bg-white/5 p-4 border border-white/10"
                      aria-hidden={index >= fanWallTeaser.length}
                    >
                      <div className="text-sm text-gray-300">
                        <span className="text-white font-semibold">{post.name}</span>{' '}
                        <span className="text-gray-400">{post.handle}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-200">{post.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Supporter Hub */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.3}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">{homeSettings.supporterHubTitle}</h2>
              <p className="mt-3 text-gray-300">{homeSettings.supporterHubSubtitle}</p>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Effectif', href: '/squad', desc: 'Joueurs, stats, profils.' },
              { label: 'Calendrier', href: '/calendar', desc: 'Tous les matches a venir.' },
              { label: 'Live Center', href: '/live', desc: 'Scores, stats, timeline.' },
              { label: 'Fan Zone', href: '/fan-zone', desc: 'Mur, sondages, highlights.' },
              { label: 'Transferts', href: '/transfers', desc: 'Rumeurs et officialisations.' },
              { label: 'Histoire', href: '/history', desc: 'Legendes, trophées, ADN.' },
            ].map((item) => (
              <FadeIn key={item.label} delay={0.35}>
                <Link
                  href={item.href}
                  className="glass rounded-2xl p-6 block hover:scale-[1.02] transition-transform"
                >
                  <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                  <p className="mt-2 text-gray-300">{item.desc}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Player Spotlight */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.3}>
            <div className="glass rounded-3xl p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="space-y-4">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-gray-200">
                    {homeSettings.spotlightLabel}
                  </p>
                  <h2 className="text-3xl font-bold text-white">
                    {featuredPlayer ? featuredPlayer.name : 'Le joueur du moment'}
                  </h2>
                  <p className="text-gray-300">
                    {featuredPlayer
                      ? `${featuredPlayer.position} · #${featuredPlayer.number} · ${featuredPlayer.nationality}`
                      : 'Profil joueur, stats et moments forts.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/squad"
                      className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      Voir l'effectif
                    </Link>
                    <Link
                      href="/news"
                      className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    >
                      Lire les interviews
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'Buts', value: '12' },
                      { label: 'Passes D', value: '7' },
                      { label: 'Note fans', value: '9.1' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-white/5 p-4 text-center">
                        <div className="text-2xl font-semibold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-red-500/10 blur-2xl" />
                  <div className="relative overflow-hidden rounded-3xl border border-white/10">
                  <img
                    src={featuredPlayer?.image || '/api/placeholder/800/900'}
                    alt={featuredPlayer?.name || 'Joueur PSG'}
                    className="h-[320px] w-full object-contain bg-black/40 sm:h-[380px]"
                  />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Match Results Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0.4}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Matchs Récents</h2>
              <p className="mt-4 text-gray-300">Découvrez les derniers résultats de match du PSG</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMatches.map((match, index) => (
              <ScaleIn key={match.id} delay={0.6 + index * 0.1}>
                <div className="glass rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-300 mb-2">{match.competition}</div>
                  <div className="text-lg font-semibold text-white mb-2">
                    {match.home} vs {match.away}
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${
                    match.result === 'W' ? 'text-green-400' :
                    match.result === 'L' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {match.score}
                  </div>
                  <div className="text-sm text-gray-400">{match.date}</div>
                </div>
              </ScaleIn>
            ))}
          </div>

          <FadeIn delay={1.2}>
            <div className="text-center mt-12">
              <Link
                href="/calendar"
                className="inline-block glass px-8 py-3 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Voir le Calendrier Complet
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
