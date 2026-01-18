import Link from 'next/link';
import EmailSubscribeForm from './EmailSubscribeForm';
import { defaultFooterSettings, readFooterSettings } from '../lib/footer-settings-store';

export default async function Footer() {
  const footerSettings = (await readFooterSettings()) ?? defaultFooterSettings;

  return (
    <footer className="border-t border-white/10 bg-[#0b1020]/90 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-wide">{footerSettings.brandTitle}</h3>
            <p className="text-gray-300 max-w-sm">{footerSettings.brandText}</p>
            <div className="flex flex-wrap gap-3">
              {['Instagram', 'Twitter', 'YouTube', 'TikTok'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/20 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-widest">Explorer</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/news" className="hover:text-white transition-colors">Actualites</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Centre live</Link></li>
              <li><Link href="/fan-zone" className="hover:text-white transition-colors">Zone supporters</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">Calendrier</Link></li>
              <li><Link href="/squad" className="hover:text-white transition-colors">Effectif</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-widest">
              {footerSettings.alertsTitle}
            </h4>
            <p className="text-gray-300">{footerSettings.alertsText}</p>
            <EmailSubscribeForm ctaLabel={footerSettings.alertsCtaLabel} />
            <p className="text-xs text-gray-500">Desinscription en un clic.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{footerSettings.bottomText}</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/history" className="hover:text-white transition-colors">Histoire</Link>
            <Link href="/transfers" className="hover:text-white transition-colors">Mercato</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialite</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
