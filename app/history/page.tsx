import Link from 'next/link';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import { defaultHistorySettings, readHistorySettings } from '../../lib/history-settings-store';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const stored = (await readHistorySettings()) ?? null;
  const settings = {
    ...defaultHistorySettings,
    ...(stored || {}),
    stats: Array.isArray(stored?.stats) ? stored.stats : defaultHistorySettings.stats,
    timeline: Array.isArray(stored?.timeline) ? stored.timeline : defaultHistorySettings.timeline,
  };
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Histoire</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm text-gray-200">{settings.heroKicker}</p>
                <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                  {settings.heroTitle}
                </h1>
                <p className="text-gray-300 max-w-xl">
                  {settings.heroSubtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                {settings.stats.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/5 p-4">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="text-xs text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-10 lg:grid-cols-[0.25fr_0.75fr]">
          <div className="text-gray-300 text-sm">
            <p className="mb-4 text-white font-semibold">{settings.introTitle}</p>
            <p>{settings.introText}</p>
          </div>
          <div className="space-y-6 border-l border-white/10 pl-6">
            {settings.timeline.map((item, idx) => (
              <ScaleIn key={item.year} delay={0.3 + idx * 0.05}>
                <div className="relative glass rounded-2xl p-6 border border-white/10">
                  <span className="absolute -left-3 top-6 h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="flex items-baseline gap-4">
                    <span className="text-red-300 font-semibold text-lg">{item.year}</span>
                    <h2 className="text-white font-semibold text-xl">{item.title}</h2>
                  </div>
                  <p className="text-gray-300 mt-2">{item.text}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>

        <FadeIn delay={0.9}>
          <div className="mt-12 text-center">
            <Link href="/news" className="text-red-300 hover:text-red-200 transition-colors font-medium">
              ← Retour aux actualites
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
