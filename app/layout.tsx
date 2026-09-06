import type { Metadata } from "next";
import { Anton, Barlow_Condensed, Bebas_Neue, IBM_Plex_Mono, IBM_Plex_Sans, Manrope } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Ticker from "../components/Ticker";
import Footer from "../components/Footer";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "ULTEAM PSG-X - Le site d'actus du Paris Saint-Germain",
  description: "Suis les dernieres actus du PSG, les scores, les infos joueurs et l'ambiance du Parc.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.className} ${bebasNeue.variable} ${manrope.variable} ${anton.variable} ${barlowCondensed.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-900`}
      >
        <Header />
        <Ticker />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
