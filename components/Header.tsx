'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeIn } from './MotionWrapper';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'News', href: '/news' },
  { name: 'Squad', href: '/squad' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Live', href: '/live' },
  { name: 'Fan Zone', href: '/fan-zone' },
  { name: 'Transfers', href: '/transfers' },
  { name: 'History', href: '/history' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admin', href: '/admin' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0b1020]/85 backdrop-blur-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-white font-bold text-xl tracking-wide">
                PSG News
              </Link>
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-200 hover:border-red-400 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
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
          <div className="md:hidden bg-[#0b1020]/95 backdrop-blur-lg">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-200 hover:border-red-400 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </header>
  );
}
