import Link from 'next/link';
import { readNews } from '../lib/news-store';
import { readMatches } from '../lib/matches-store';
import { fetchFootballDataMatches } from '../lib/football-data';
import { readLiveMatch } from '../lib/live-match-store';
import { readSquad } from '../lib/squad-store';
import { defaultHomeSettings, readHomeSettings } from '../lib/home-settings-store';
import { defaultStandings, readStandings } from '../lib/standings-store';
import EmailSubscribeForm from '../components/EmailSubscribeForm';

export const dynamic = 'force-dynamic';

const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

const normalizeImage = (value?: string) => {
  if (!value) return '/api/placeholder/600/400';
  const trimmed = value.split('/api/placeholder')[0].trim();
  return trimmed.length > 0 ? trimmed : '/api/placeholder/600/400';
};

const formatDateLabel = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const formatShortDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase();
};

const computeReadMinutes = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const supporterCards = [
  { title: 'Mur des fans', desc: 'Les messages qui font vibrer le Parc.' },
  { title: 'Sondage', desc: 'Ton homme du match, chaque semaine.' },
  { title: 'Pronostics', desc: 'Le score exact avant le coup d’envoi.' },
  { title: 'Temps forts', desc: 'Les séquences qui ont fait basculer.' },
];

const squadFilters = ['Tous', 'Gardiens', 'Défenseurs', 'Milieux', 'Attaquants'];

export default async function Home() {
  const news = await readNews();
  const apiMatches = await fetchFootballDataMatches();
  const matches = apiMatches && apiMatches.length > 0 ? apiMatches : await readMatches();
  const liveMatch = await readLiveMatch();
  const squad = await readSquad();
  const homeSettings = (await readHomeSettings()) ?? defaultHomeSettings;
  const standings = (await readStandings()) ?? defaultStandings;

  const sortedNews = sortByDateDesc(news);
  const latestArticle = sortedNews[0];
  const filFeatured = sortedNews[1];
  const filGrid = sortedNews.slice(2, 5);

  const upcomingMatches = sortByDateDesc(matches.filter((match) => match.status === 'upcoming')).reverse();
  const nextMatch = upcomingMatches[0];
  const nextMatchDate = nextMatch ? new Date(`${nextMatch.date}T${nextMatch.time}`) : null;
  const daysToMatch = nextMatchDate
    ? Math.max(0, Math.ceil((nextMatchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isLive = liveMatch?.status === 'live';
  const matchdayCompetition =
    homeSettings.matchdayCompetition?.trim() || nextMatch?.competition || 'Paris Saint-Germain';
  const matchdayHome = homeSettings.matchdayHomeTeam?.trim() || liveMatch?.home.name || nextMatch?.home || 'PSG';
  const matchdayAway =
    homeSettings.matchdayAwayTeam?.trim() || liveMatch?.away.name || nextMatch?.away || 'Adversaire';
  const matchdayStadium = homeSettings.matchdayStadium?.trim() || liveMatch?.stadium || nextMatch?.stadium || 'Parc des Princes';
  const goalEvents = isLive ? (liveMatch?.events ?? []).filter((event) => event.type === 'goal') : [];
  const matchProgress = isLive ? Math.min(100, ((liveMatch?.minute ?? 0) / 90) * 100) : 0;

  const heroLabel = (homeSettings.heroLabel?.trim() || defaultHomeSettings.heroLabel).toUpperCase();
  const heroTitle = homeSettings.heroTitle?.trim() || latestArticle?.title || defaultHomeSettings.heroTitle;
  const heroExcerpt = homeSettings.heroExcerpt?.trim() || latestArticle?.excerpt || defaultHomeSettings.heroExcerpt;
  const heroPrimaryLabel = homeSettings.heroPrimaryLabel?.trim() || defaultHomeSettings.heroPrimaryLabel;
  const heroPrimaryHref =
    homeSettings.heroPrimaryHref?.trim() || (latestArticle ? `/news/${latestArticle.id}` : defaultHomeSettings.heroPrimaryHref);
  const heroSecondaryLabel = homeSettings.heroSecondaryLabel?.trim() || defaultHomeSettings.heroSecondaryLabel;
  const heroSecondaryHref = homeSettings.heroSecondaryHref?.trim() || defaultHomeSettings.heroSecondaryHref;
  const heroDateLabel = formatDateLabel(latestArticle?.date ?? new Date().toISOString().slice(0, 10));

  const featuredPlayer = squad.players.find((player) => player.group === 'forward') ?? squad.players[0];
  const featuredIndex = featuredPlayer ? squad.players.findIndex((player) => player.id === featuredPlayer.id) : -1;
  const carouselPlayers =
    featuredIndex >= 0 && squad.players.length >= 5
      ? Array.from(
          { length: 5 },
          (_, i) => squad.players[(featuredIndex - 2 + i + squad.players.length * 2) % squad.players.length]
        )
      : squad.players.slice(0, 5);

  const ligue1Standings = standings.ligue1.slice(0, 4);
  const nextThreeMatches = upcomingMatches.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#001b31]">
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'radial-gradient(120% 90% at 70% -20%, #0a5590 0%, #004170 40%, #001b31 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-45"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.10) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div
          className="absolute -right-36 -top-40 h-[900px] w-[760px] rotate-[16deg]"
          style={{
            background: 'linear-gradient(180deg, rgba(227,6,19,.85), rgba(227,6,19,0))',
            clipPath: 'polygon(40% 0,100% 0,60% 100%,0 100%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
          <div className="psgx-rise-in">
            <div className="mb-5 inline-flex flex-wrap">
              <span className="bg-[#E30613] px-3.5 py-2 font-plex-sans text-[11px] font-bold tracking-[0.18em] text-white">
                {heroLabel}
              </span>
              <span className="bg-black/35 px-3.5 py-2 font-plex-mono text-[11px] tracking-[0.14em] text-[#CEAB5D]">
                {heroDateLabel}
              </span>
            </div>
            <h1
              className="font-anton uppercase text-white"
              style={{ fontSize: 'clamp(48px,6.4vw,92px)', lineHeight: 0.88 }}
            >
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-xl font-plex-sans text-[17px] leading-relaxed text-[#c3d8ea]">{heroExcerpt}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={heroPrimaryHref}
                className="bg-[#E30613] px-7 py-4 font-plex-sans text-[13px] font-bold tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#CEAB5D] hover:text-[#001b31]"
              >
                {heroPrimaryLabel}
              </Link>
              <Link
                href={heroSecondaryHref}
                className="border border-white/40 px-7 py-4 font-plex-sans text-[13px] font-bold tracking-[0.12em] text-white transition-all hover:bg-white hover:text-[#004170]"
              >
                {heroSecondaryLabel}
              </Link>
            </div>
          </div>
          <div className="psgx-rise-in relative flex min-h-[420px] items-end justify-center">
            <div className="psgx-pulsering absolute left-1/2 top-[46%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CEAB5D]/50" />
            <div
              className="psgx-float relative flex h-[440px] w-full max-w-[400px] items-end justify-center border border-white/20 pb-5"
              style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 8px, transparent 8px 16px)' }}
            >
              <span className="font-plex-mono text-[11px] tracking-[0.1em] text-white/55">PHOTO JOUEUR DÉTOURÉE</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE BOARD */}
      <section className="psgx-sweep relative overflow-hidden border-t-2 border-[#E30613] bg-[#00284a]">
        <div
          className="absolute inset-0"
          style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 64px)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {isLive ? (
              <>
                <span className="flex items-center gap-2 bg-[#E30613] px-2.5 py-1.5 font-plex-sans text-[11px] font-bold tracking-[0.14em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white psgx-blink" />
                  LIVE
                </span>
                <span className="font-plex-mono text-xs tracking-[0.16em] text-[#CEAB5D]">{liveMatch?.minute}&apos;</span>
              </>
            ) : (
              <span className="bg-white/10 px-2.5 py-1.5 font-plex-sans text-[11px] font-bold tracking-[0.14em] text-[#CEAB5D]">
                J-{daysToMatch ?? '--'} AVANT MATCH
              </span>
            )}
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">
              {matchdayCompetition} · {matchdayStadium}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <span className="font-anton uppercase text-white" style={{ fontSize: 'clamp(30px,3.6vw,46px)' }}>
              {matchdayHome}
            </span>
            <span className="font-anton text-white" style={{ fontSize: 'clamp(34px,4.2vw,54px)' }}>
              {isLive ? liveMatch?.home.score : '00'}
            </span>
            <span className="font-anton text-[30px] text-white/30">:</span>
            <span className="font-anton text-[#E30613]" style={{ fontSize: 'clamp(34px,4.2vw,54px)' }}>
              {isLive ? liveMatch?.away.score : '00'}
            </span>
            <span
              className="font-anton uppercase text-white/50"
              style={{ fontSize: 'clamp(30px,3.6vw,46px)' }}
            >
              {matchdayAway}
            </span>
          </div>

          {isLive && goalEvents.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-6 text-sm text-white/75">
              {goalEvents.map((event, index) => (
                <span key={index}>
                  <span className="font-plex-mono text-[#CEAB5D]">{event.minute}&apos;</span> {event.player}
                </span>
              ))}
            </div>
          )}

          {isLive && (
            <div className="relative mt-7 h-11">
              <div className="absolute left-0 right-0 top-[11px] h-0.5 bg-white/18" />
              <div className="absolute left-0 top-[11px] h-0.5 bg-[#E30613]" style={{ width: `${matchProgress}%` }} />
              {goalEvents.map((event, index) => (
                <div
                  key={index}
                  className="absolute top-[5px] h-3.5 w-3.5 rounded-full border-[3px] border-[#E30613] bg-white"
                  style={{ left: `${Math.min(96, (event.minute / 90) * 100)}%` }}
                />
              ))}
              <div className="absolute inset-x-0 top-[26px] flex justify-between font-plex-mono text-[10px] text-white/45">
                <span>0</span>
                <span>15</span>
                <span>30</span>
                <span>45</span>
                <span>60</span>
                <span>75</span>
                <span>90</span>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {isLive ? (
              <>
                <Link href="/live" className="bg-white px-5 py-2.5 font-plex-sans text-sm font-semibold text-[#004170] transition-colors hover:bg-[#CEAB5D]">
                  Fil du match
                </Link>
                <Link href="/live" className="border border-white/35 px-5 py-2.5 font-plex-sans text-sm font-semibold text-white transition-colors hover:bg-white/15">
                  Compositions
                </Link>
                <Link href="/live" className="border border-white/35 px-5 py-2.5 font-plex-sans text-sm font-semibold text-white transition-colors hover:bg-white/15">
                  Statistiques
                </Link>
              </>
            ) : (
              <>
                <Link href="/calendar" className="bg-white px-5 py-2.5 font-plex-sans text-sm font-semibold text-[#004170] transition-colors hover:bg-[#CEAB5D]">
                  Voir le calendrier
                </Link>
                <Link href="/fan-zone" className="border border-white/35 px-5 py-2.5 font-plex-sans text-sm font-semibold text-white transition-colors hover:bg-white/15">
                  Zone supporters
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CARROUSEL JOUEURS */}
      {carouselPlayers.length > 0 && (
        <section
          className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8"
          style={{ background: 'radial-gradient(110% 100% at 50% 0%, #0a5590 0%, #00294b 45%, #001b31 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.09) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-baseline gap-3">
              <span className="font-anton text-3xl uppercase text-white">L&apos;effectif</span>
              <span className="font-plex-mono text-xs tracking-[0.14em] text-[#CEAB5D]">SAISON 2026-27</span>
            </div>
            <div className="flex flex-wrap items-end justify-center gap-4" style={{ perspective: '1500px' }}>
              {carouselPlayers.map((player, index) => {
                const isCenter = index === 2;
                const side = index < 2 ? -1 : 1;
                const rotation = isCenter ? 0 : side * (Math.abs(index - 2) === 2 ? 16 : 9);
                const size = isCenter
                  ? { width: 300, height: 420 }
                  : Math.abs(index - 2) === 2
                  ? { width: 150, height: 250 }
                  : { width: 180, height: 300 };

                if (isCenter) {
                  return (
                    <div key={player.id} className="relative" style={{ width: size.width, height: size.height, margin: '0 6px' }}>
                      <div className="psgx-pulsering absolute left-1/2 top-[44%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CEAB5D]/55" />
                      <div
                        className="psgx-float relative flex h-full flex-col items-center justify-end overflow-hidden pb-6"
                        style={{
                          borderRadius: '18px 18px 80px 18px',
                          background: 'linear-gradient(180deg, rgba(206,171,93,.22), rgba(0,65,112,.1))',
                          border: '1px solid rgba(206,171,93,.5)',
                          boxShadow: '0 30px 80px rgba(0,0,0,.45)',
                        }}
                      >
                        <div className="absolute right-5 top-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#E30613] font-anton text-[32px] text-white">
                          {player.number}
                        </div>
                        <img
                          src={normalizeImage(player.image)}
                          alt={player.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-70"
                        />
                        <span className="relative text-[13px] tracking-[0.24em] text-[#CEAB5D]">
                          {player.position.toUpperCase()}
                        </span>
                        <span className="relative font-anton text-[44px] uppercase leading-tight text-white">
                          {player.name}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={player.id}
                    href="/squad"
                    className="group flex flex-col items-center justify-end overflow-hidden transition-all duration-300"
                    style={{
                      width: size.width,
                      height: size.height,
                      borderRadius: Math.abs(index - 2) === 2 ? '12px 12px 52px 12px' : '14px 14px 62px 14px',
                      background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02))',
                      border: '1px solid rgba(255,255,255,.18)',
                      transform: `rotateY(${rotation}deg) scale(${Math.abs(index - 2) === 2 ? 0.94 : 1})`,
                      opacity: Math.abs(index - 2) === 2 ? 0.6 : 0.8,
                      paddingBottom: Math.abs(index - 2) === 2 ? 14 : 16,
                    }}
                  >
                    <img src={normalizeImage(player.image)} alt={player.name} className="absolute inset-0 h-full w-full object-cover" />
                    <span className="relative font-barlow text-[16px] font-bold uppercase text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,.7)' }}>
                      {player.name}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {squadFilters.map((label) => (
                <Link
                  key={label}
                  href="/squad"
                  className="rounded-full border border-white/25 px-5 py-2 font-plex-sans text-[13px] tracking-[0.14em] text-white/75 transition-colors hover:border-[#CEAB5D] hover:text-[#CEAB5D]"
                >
                  {label.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FIL + COLONNE */}
      <section className="bg-[#f4f5f7] px-4 py-13 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="font-anton text-[34px] uppercase text-[#00284a]">Le fil</span>
              <span className="h-0.5 flex-1 bg-[#E30613]" />
              <Link href="/news" className="whitespace-nowrap font-plex-mono text-xs tracking-[0.14em] text-[#E30613]">
                TOUT VOIR →
              </Link>
            </div>

            {filFeatured && (
              <Link
                href={`/news/${filFeatured.id}`}
                className="grid grid-cols-1 items-center gap-5 border-b border-[#dfe4e9] pb-6 sm:grid-cols-2"
              >
                <img
                  src={normalizeImage(filFeatured.image)}
                  alt={filFeatured.title}
                  className="h-[230px] w-full object-cover"
                />
                <div>
                  <span className="font-plex-mono text-[11px] tracking-[0.14em] text-[#E30613]">ARTICLE</span>
                  <div className="mt-2.5 font-anton text-[32px] uppercase leading-tight text-[#00284a]">
                    {filFeatured.title}
                  </div>
                  <p className="mt-3 font-plex-sans text-[15px] leading-relaxed text-[#59656f]">{filFeatured.excerpt}</p>
                  <div className="mt-3.5 font-plex-mono text-[11px] text-[#98a4b0]">
                    {formatShortDate(filFeatured.date)} · {computeReadMinutes(filFeatured.content ?? filFeatured.excerpt)} MIN
                  </div>
                </div>
              </Link>
            )}

            {filGrid.length > 0 && (
              <div className="mt-6 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {filGrid.map((article, index) => {
                  const accent = ['#E30613', '#004170', '#CEAB5D'][index % 3];
                  return (
                    <Link
                      key={article.id}
                      href={`/news/${article.id}`}
                      className="block bg-white transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                      style={{ borderBottom: `4px solid ${accent}` }}
                    >
                      <img src={normalizeImage(article.image)} alt={article.title} className="h-[150px] w-full object-cover" />
                      <div className="px-[18px] pb-5 pt-4">
                        <div className="font-anton text-[21px] uppercase leading-tight text-[#00284a]">{article.title}</div>
                        <div className="mt-3 font-plex-mono text-[11px] text-[#98a4b0]">
                          {formatShortDate(article.date)} · {computeReadMinutes(article.content ?? article.excerpt)} MIN
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-[#e2e7ec] bg-white">
              <div className="bg-[#00284a] px-4 py-3 font-plex-sans text-xs font-bold uppercase tracking-[0.14em] text-white">
                Classement Ligue 1
              </div>
              {ligue1Standings.map((row) => (
                <div
                  key={row.pos}
                  className={`flex justify-between px-4 py-3 text-sm ${
                    row.club === 'PSG'
                      ? 'bg-[#eef3f7] font-bold text-[#00284a]'
                      : 'border-t border-[#eef1f4] text-[#39444e]'
                  }`}
                >
                  <span>{row.pos}. {row.club}</span>
                  <span>{row.pts}</span>
                </div>
              ))}
            </div>

            {nextThreeMatches.length > 0 && (
              <div className="border border-[#e2e7ec] bg-white">
                <div className="bg-[#00284a] px-4 py-3 font-plex-sans text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Prochains matchs
                </div>
                {nextThreeMatches.map((match, index) => (
                  <div key={match.id} className={`px-4 py-3.5 ${index > 0 ? 'border-t border-[#eef1f4]' : ''}`}>
                    <div className="font-plex-mono text-[11px] text-[#98a4b0]">
                      {formatShortDate(match.date)} · {match.time} · {match.competition}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#0d1b26]">
                      {match.home} — {match.away}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="psgx-sweep relative overflow-hidden bg-[#00284a] p-6">
              <div className="relative">
                <div className="font-anton text-2xl uppercase leading-tight text-white">{homeSettings.alertsTitle}</div>
                <p className="mb-4 mt-2 font-plex-sans text-[13px] leading-relaxed text-white/75">
                  {homeSettings.alertsSubtitle}
                </p>
                <EmailSubscribeForm ctaLabel="Activer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE SUPPORTERS */}
      <section className="border-t-2 border-[#E30613] bg-[#001b31] px-4 py-13 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <span className="font-anton text-3xl uppercase text-white">{homeSettings.fanZoneTitle}</span>
            <span className="font-plex-mono text-xs tracking-[0.14em] text-[#CEAB5D]">
              {(homeSettings.fanZoneSubtitle || 'Mur · Sondages · Pronostics').toUpperCase()}
            </span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {supporterCards.map((card) => (
              <Link
                key={card.title}
                href="/fan-zone"
                className="block border border-white/14 p-5 transition-all hover:-translate-y-1 hover:border-[#CEAB5D]"
              >
                <div className="font-barlow text-[20px] font-bold uppercase tracking-[0.06em] text-white">{card.title}</div>
                <p className="mt-2 font-plex-sans text-sm leading-relaxed text-[#93b0c9]">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
