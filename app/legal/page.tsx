import Link from 'next/link';
import { FadeIn } from '../../components/MotionWrapper';

export const dynamic = 'force-dynamic';

export default function LegalPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <FadeIn delay={0.2}>
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold text-white">Mentions legales</h1>
            <p className="text-gray-300">Informations legales et contact.</p>
          </div>
        </FadeIn>

        <div className="glass rounded-2xl p-8 space-y-6 text-gray-300">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Editeur du site</h2>
            <p>ULTEAM PSG-X</p>
            <p>Email: contact@ulteampsgx.com</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Hebergement</h2>
            <p>Railway</p>
            <p>San Francisco, CA, USA</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Propriete intellectuelle</h2>
            <p>Les contenus de ce site sont fournis a titre informatif. Toute reproduction est interdite sans accord.</p>
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
