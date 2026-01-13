import { FadeIn, ScaleIn } from '../../components/MotionWrapper';
import { readSquad } from '../../lib/squad-store';

export const dynamic = 'force-dynamic';

const groupLabels = {
  goalkeeper: 'Gardiens',
  defender: 'Defenseurs',
  midfielder: 'Milieux',
  forward: 'Attaquants',
};

const normalizeImage = (value?: string) => {
  if (!value) return '/api/placeholder/300/400';
  const trimmed = value.split('/api/placeholder')[0].trim();
  return trimmed.length > 0 ? trimmed : '/api/placeholder/300/400';
};

export default async function SquadPage() {
  const { players, staff } = await readSquad();
  const totalPlayers = players.length;
  const averageAge = totalPlayers > 0
    ? Math.round(players.reduce((sum, player) => sum + player.age, 0) / totalPlayers)
    : 0;
  const grouped = {
    goalkeeper: players.filter((player) => player.group === 'goalkeeper'),
    defender: players.filter((player) => player.group === 'defender'),
    midfielder: players.filter((player) => player.group === 'midfielder'),
    forward: players.filter((player) => player.group === 'forward'),
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Effectif</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm text-gray-200">Saison 2025-2026</p>
                <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                  L&apos;effectif PSG
                </h1>
                <p className="text-gray-300 max-w-xl">
                  Du gardien au buteur, une equipe taillée pour les grandes nuits.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
                    <div className="text-2xl font-semibold text-white">{totalPlayers}</div>
                    <div className="text-xs text-gray-400">Joueurs</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
                    <div className="text-2xl font-semibold text-white">{averageAge}</div>
                    <div className="text-xs text-gray-400">Age moyen</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
                    <div className="text-2xl font-semibold text-white">4</div>
                    <div className="text-xs text-gray-400">Lignes</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 text-sm text-gray-200">
                <p className="text-white font-semibold mb-3">Focus</p>
                <p className="text-gray-300">
                  Une base jeune et explosive, mixee avec l&apos;experience europeenne.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="space-y-12">
            {Object.entries(grouped).map(([groupKey, groupPlayers], groupIndex) => (
              <div key={groupKey}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    {groupLabels[groupKey as keyof typeof groupLabels]}
                  </h2>
                  <span className="text-sm text-gray-400">{groupPlayers.length} joueurs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {groupPlayers.map((player, index) => (
                    <ScaleIn key={player.id} delay={0.5 + groupIndex * 0.1 + index * 0.05}>
                      <div className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                        <img
                          src={normalizeImage(player.image)}
                          alt={player.name}
                          className="h-60 w-full object-cover"
                        />
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-semibold text-red-300">#{player.number}</span>
                            <span className="text-xs text-gray-400">{player.nationality}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                          <p className="text-sm text-gray-300">{player.position}</p>
                          <p className="text-xs text-gray-400 mt-1">Age {player.age}</p>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.9}>
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Staff</h2>
              <span className="text-sm text-gray-400">{staff.length} membres</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member, index) => (
                <ScaleIn key={member.id} delay={1.0 + index * 0.05}>
                  <div className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={normalizeImage(member.image)}
                      alt={member.name}
                      className="h-60 w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                      <p className="text-red-300 text-sm">{member.role}</p>
                      <p className="text-xs text-gray-400 mt-1">{member.nationality}</p>
                    </div>
                  </div>
                </ScaleIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
