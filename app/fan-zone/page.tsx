import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import FanWallComposer from '../../components/FanWallComposer';
import FanZonePoll from '../../components/FanZonePoll';
import FanZonePredictions from '../../components/FanZonePredictions';
import FanZoneChallenge from '../../components/FanZoneChallenge';
import { readFanWall } from '../../lib/fan-wall-store';

const highlights = [
  {
    id: 1,
    title: 'Contre fulgurant',
    detail: 'Sortie de balle en 3 passes, frappe enroulee.',
    time: '58:21',
  },
  {
    id: 2,
    title: 'Action collective',
    detail: 'Triangle dans la surface, tir en premiere intention.',
    time: '41:09',
  },
  {
    id: 3,
    title: 'Parade du match',
    detail: 'Reflexe incroyable sur une tete a bout portant.',
    time: '33:52',
  },
];

const chants = [
  { id: 1, title: 'Allez Paris', tempo: 'Rapide' },
  { id: 2, title: 'Ici c\'est Paris', tempo: 'Moyen' },
  { id: 3, title: 'Tous ensemble', tempo: 'Lent' },
];

export const dynamic = 'force-dynamic';

export default async function FanZonePage() {
  const wallPosts = (await readFanWall()).filter((post) => post.approved);
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-10">
            <div className="matchday-tape">Zone supporters</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-gray-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-400 matchday-blink" />
                En direct des supporters
              </p>
              <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                Zone supporters
              </h1>
              <p className="max-w-2xl text-lg text-gray-300">
                Le mur des supporters, les sondages jour de match et les moments forts pour vivre le match ensemble.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <ScaleIn delay={0.3}>
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Mur des fans</h2>
                  <p className="text-gray-400">Les reactions les plus chaudes du moment.</p>
                </div>
              </div>
              <FanWallComposer />
              <div className="space-y-4">
                {wallPosts.map((post, index) => (
                  <ScaleIn key={post.id} delay={0.35 + index * 0.05}>
                    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="text-white font-semibold">
                          {post.name} <span className="text-gray-400">{post.handle}</span>
                        </span>
                        <span>{post.time}</span>
                      </div>
                      <p className="mt-2 text-gray-200">{post.message}</p>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </ScaleIn>

          <div className="space-y-6">
            <ScaleIn delay={0.35}>
              <FanZonePoll />
            </ScaleIn>

            <ScaleIn delay={0.4}>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Chants du Parc</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  {chants.map((chant) => (
                    <div key={chant.id} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                      <span className="text-white font-semibold">{chant.title}</span>
                      <span>{chant.tempo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.45}>
              <FanZonePredictions />
            </ScaleIn>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <ScaleIn delay={0.35} className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Temps forts</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((highlight, index) => (
                  <ScaleIn key={highlight.id} delay={0.4 + index * 0.05}>
                    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                      <div className="text-xs text-gray-400 mb-2">Clip {highlight.time}</div>
                      <div className="text-white font-semibold">{highlight.title}</div>
                      <p className="mt-2 text-sm text-gray-300">{highlight.detail}</p>
                      <button
                        className="mt-4 inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                        type="button"
                      >
                        Lancer
                      </button>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </ScaleIn>

          <ScaleIn delay={0.45}>
            <FanZoneChallenge />
          </ScaleIn>
        </div>
      </div>
    </div>
  );
}
