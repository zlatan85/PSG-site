import Link from 'next/link';
import EmailSubscribeForm from './EmailSubscribeForm';
import { defaultFooterSettings, readFooterSettings } from '../lib/footer-settings-store';

export default async function Footer() {
  const footerSettings = (await readFooterSettings()) ?? defaultFooterSettings;

  return (
    <footer className="border-t-2 border-[#E30613] bg-[#001b31] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-4">
            <h3 className="font-anton text-xl tracking-wide">{footerSettings.brandTitle}</h3>
            <p className="font-plex-sans max-w-sm text-[#93b0c9]">{footerSettings.brandText}</p>
            <div className="flex flex-wrap gap-3">
              {['Instagram', 'Twitter', 'YouTube', 'TikTok'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-plex-sans rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#93b0c9] transition-colors hover:bg-white/20 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-plex-mono mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#CEAB5D]">
              Explorer
            </h4>
            <ul className="font-plex-sans space-y-2 text-[#93b0c9]">
              <li><Link href="/news" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Centre live</Link></li>
              <li><Link href="/fan-zone" className="hover:text-white transition-colors">Zone supporters</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">Calendrier</Link></li>
              <li><Link href="/squad" className="hover:text-white transition-colors">Effectif</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-plex-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#CEAB5D]">
              {footerSettings.alertsTitle}
            </h4>
            <p className="font-plex-sans text-[#93b0c9]">{footerSettings.alertsText}</p>
            <EmailSubscribeForm ctaLabel={footerSettings.alertsCtaLabel} />
            <p className="font-plex-sans text-xs text-[#4b6379]">Désinscription en un clic.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 font-plex-mono text-[11px] text-[#4b6379] sm:flex-row sm:items-center sm:justify-between">
          <p>{footerSettings.bottomText}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="hover:text-[#CEAB5D] transition-colors">Contact</Link>
            <Link href="/history" className="hover:text-[#CEAB5D] transition-colors">Histoire</Link>
            <Link href="/transfers" className="hover:text-[#CEAB5D] transition-colors">Mercato</Link>
            <Link href="/legal" className="hover:text-[#CEAB5D] transition-colors">Mentions légales</Link>
            <Link href="/privacy" className="hover:text-[#CEAB5D] transition-colors">Confidentialité</Link>
          </div>
          <span className="tracking-[0.1em]">SITE INDÉPENDANT — NON AFFILIÉ AU CLUB</span>
        </div>
      </div>
    </footer>
  );
}
