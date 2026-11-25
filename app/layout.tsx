import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PersistentAudio from './components/PersistentAudio';
import RouteTransition from './components/RouteTransition';
import './components/route-transition.css';
import {SiteLanguageProvider} from './components/SiteLanguage';
import './components/site-language.css';
import './components/site-theme.css';
import './components/ambient-music.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VARTANA · Botanical Wellness",
  description: "Teh herbal dari rempah Indonesia. Jelajahi racikan jahe, serai, kunyit, dan pilihan teh herbal VARTANA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><SiteLanguageProvider><RouteTransition>{children}</RouteTransition><PersistentAudio/></SiteLanguageProvider></body>
    </html>
  );
}
