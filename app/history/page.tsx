import Link from 'next/link';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

const timeline = [
  { year: '1970', title: 'Foundation', text: 'Paris Saint-Germain Football Club is founded by merger of Stade Saint-Germain and Paris FC.' },
  { year: '1972', title: 'First Trophy', text: 'PSG wins its first major trophy, the Coupe de France.' },
  { year: '1974', title: 'European Debut', text: 'First appearance in European competition with UEFA Cup Winners\' Cup.' },
  { year: '1982', title: 'Stade Parc des Princes', text: 'PSG moves to the iconic Parc des Princes stadium.' },
  { year: '1986', title: 'First League Title', text: 'PSG wins its first Ligue 1 championship under manager Gérard Houllier.' },
  { year: '1994-1996', title: 'European Breakthrough', text: 'PSG wins Coupe des Coupes (1996) and reaches UEFA Cup final (1997).' },
  { year: '1998', title: 'World Cup Glory', text: 'France wins World Cup with several PSG players in the squad.' },
  { year: '2000', title: 'Century Trophy', text: 'PSG wins Coupe de la Ligue, completing a domestic cup double.' },
  { year: '2011', title: 'Qatari Investment', text: 'Qatar Sports Investments acquires majority stake, beginning new era.' },
  { year: '2013', title: 'First Champions League Semi-Final', text: 'PSG reaches Champions League semi-finals for the first time.' },
  { year: '2015', title: 'Domestic Dominance', text: 'PSG wins Ligue 1, Coupe de France, and Coupe de la Ligue treble.' },
  { year: '2017', title: 'Galácticos Era Begins', text: 'Signing of Neymar Jr. marks beginning of superstar acquisitions.' },
  { year: '2018', title: 'Mbappé Joins', text: 'Kylian Mbappé signs from Monaco, becoming one of world\'s most expensive transfers.' },
  { year: '2020', title: 'UCL Final', text: 'PSG reaches its first Champions League final.' },
  { year: '2021', title: 'Messi Arrives', text: 'Lionel Messi joins PSG after leaving Barcelona, completing holy trinity with Neymar and Mbappé.' },
  { year: '2022', title: 'Domestic Success', text: 'PSG wins Ligue 1 title and reaches Champions League final again.' },
  { year: '2023', title: 'Continued Excellence', text: 'PSG maintains position as France\'s top club with continued European ambitions.' },
  { year: '2024', title: 'Future Champions', text: 'PSG continues to build towards Champions League glory with world-class squad.' },
];

export default function HistoryPage() {
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
                <p className="text-sm text-gray-200">Depuis 1970</p>
                <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                  L&apos;ADN PSG
                </h1>
                <p className="text-gray-300 max-w-xl">
                  Un club parisien, une ambition europeenne, une histoire faite de titres et de legends.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                {[
                  { label: 'Ligue 1', value: '11' },
                  { label: 'Coupes', value: '30+' },
                  { label: 'Finales europeennes', value: '2' },
                  { label: 'Legendes', value: '100%' },
                ].map((item) => (
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
            <p className="mb-4 text-white font-semibold">Temps forts</p>
            <p>Des origines a l&apos;ere moderne, PSG ne cesse d&apos;elever ses standards.</p>
          </div>
          <div className="space-y-6 border-l border-white/10 pl-6">
            {timeline.map((item, idx) => (
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
