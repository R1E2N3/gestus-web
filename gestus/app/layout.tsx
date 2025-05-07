import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import logoImg from "./images/logo.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestus - Pratique Língua de Sinais",
  description: "Pratique língua de sinais com Gestus - escolha seu idioma e comece a aprender.",
};

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/our-solution", label: "Nossa Solução" },
  { href: "/about", label: "Sobre Nós" },
  { href: "/prototype", label: "Protótipo" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col items-center py-10 px-4 gap-8 shadow-lg">
            {/* Custom Logo */}
            <div className="flex items-center space-x-2">
              <Image src={logoImg} alt="Gestus Logo" width={48} height={48} className="h-12 w-12" />
              <span className="text-2xl font-bold text-[var(--accent)]">GESTUS</span>
            </div>
            <nav className="flex flex-col w-full gap-2 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-full px-4 py-3 rounded-lg text-lg font-semibold text-left hover:bg-[var(--accent)] hover:text-white transition"
                  prefetch
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Auth Buttons */}
            <div className="mt-auto flex flex-col w-full gap-2">
              <Link href="/login" className="w-full px-4 py-3 rounded-lg font-semibold text-center text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition" prefetch>
                Entrar
              </Link>
              <Link href="/get-started" className="w-full px-4 py-3 rounded-lg bg-[var(--accent)] text-white text-center font-semibold hover:opacity-90 transition">
                Comece
              </Link>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 bg-[var(--background)] min-h-screen overflow-x-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
