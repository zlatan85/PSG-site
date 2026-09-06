'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeIn } from './MotionWrapper';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Actus', href: '/news' },
  { name: 'Effectif', href: '/squad' },
  { name: 'Calendrier', href: '/calendar' },
  { name: 'Direct', href: '/live' },
  { name: 'Zone supporters', href: '/fan-zone' },
  { name: 'Transferts', href: '/transfers' },
  { name: 'Histoire', href: '/history' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 border-b-2 border-[#E30613] bg-[#001428]/92 backdrop-blur-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="font-anton text-xl tracking-wide text-white whitespace-nowrap">
            ULTEAM <span className="text-[#E30613]">PSG-X</span>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-5 font-barlow text-[13px] font-semibold uppercase tracking-[0.14em] text-[#93b0c9]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#E30613] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/live"
              className="flex items-center gap-2 bg-[#E30613] px-3 py-1.5 font-plex-sans text-[11px] font-bold tracking-[0.14em] text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white psgx-blink" />
              DIRECT
            </Link>
            <Link
              href="/profile"
              className="border border-[#CEAB5D] px-4 py-2 font-plex-sans text-xs font-semibold tracking-[0.14em] text-[#CEAB5D] transition-colors hover:bg-[#CEAB5D] hover:text-[#001b31]"
            >
              CONNEXION
            </Link>
          </div>

          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <FadeIn>
          <div className="lg:hidden bg-[#001428]/97 backdrop-blur-lg">
            <div className="space-y-1 pb-3 pt-2 font-barlow text-sm font-semibold uppercase tracking-[0.1em]">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-[#93b0c9] hover:border-[#E30613] hover:bg-white/10 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/profile"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-[#CEAB5D] hover:border-[#CEAB5D] hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            </div>
          </div>
        </FadeIn>
      )}
    </header>
  );
}
