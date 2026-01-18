import Link from 'next/link';
import { FadeIn } from '../../components/MotionWrapper';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <FadeIn delay={0.2}>
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold text-white">Politique de confidentialite</h1>
            <p className="text-gray-300">Comment nous utilisons vos donnees.</p>
          </div>
        </FadeIn>

        <div className="glass rounded-2xl p-8 space-y-6 text-gray-300">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Donnees collectees</h2>
            <p>Nous collectons uniquement les informations necessaires a la creation de compte et aux interactions.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Utilisation</h2>
            <p>Vos donnees servent a gerer les connexions, la moderation et les statistiques anonymes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Suppression</h2>
            <p>Vous pouvez demander la suppression de votre compte a tout moment.</p>
          </section>
        </div>

        <div className="text-center">
          <Link href="/" className="text-red-300 hover:text-red-200 transition-colors">
            ← Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
