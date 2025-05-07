import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import logoImg from "./images/logo.png";

import Nav from "./components/Nav/page";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Gestus - Pratique Língua de Sinais",
  description: "Pratique língua de sinais com Gestus - escolha seu idioma e comece a aprender.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={`${lexend.variable} font-lexend antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <main className="bg-[var(--background)] min-h-screen overflow-x-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
