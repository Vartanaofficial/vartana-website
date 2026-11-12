import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PersistentAudio from './components/PersistentAudio';
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

export const metadata: Metadata = {
  title: "VARTANA · Botanical Wellness",
  description: "Teh herbal dari rempah Indonesia. Jelajahi racikan jahe, serai, kunyit, dan pilihan teh herbal VARTANA.",
  icons: {
    icon: "/Logo Vartana Bulat.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><SiteLanguageProvider>{children}<PersistentAudio/></SiteLanguageProvider></body>
    </html>
  );
}
