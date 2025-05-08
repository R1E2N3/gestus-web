import type React from "react"
import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import Footer from "./components/Footer"

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
})

export const metadata: Metadata = {
  title: "Gestus - Pratique Língua de Sinais",
  description: "Pratique língua de sinais com Gestus - escolha seu idioma e comece a aprender.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={`${lexend.variable} font-lexend antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <LanguageProvider>
          <main className="bg-[var(--background)] min-h-screen overflow-x-auto">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
