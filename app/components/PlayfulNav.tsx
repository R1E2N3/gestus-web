"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HandSymbolSmall from "./HandSymbolSmall";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "../hooks/useTranslation";

type NavLinkKey = "home" | "solution" | "about" | "game" | "contribute";

interface NavLink {
  href: string;
  key: NavLinkKey;
  emoji: string;
}

const navLinks: NavLink[] = [
  { href: "/", key: "home", emoji: "🏠" },
  { href: "/our-solution", key: "solution", emoji: "💡" },
  { href: "/about", key: "about", emoji: "👋" },
  { href: "/game", key: "game", emoji: "🎮" },
  { href: "/contribute", key: "contribute", emoji: "✨" },
];

export default function PlayfulNav() {
  const [activeLink, setActiveLink] = useState("/");
  const [hoverLink, setHoverLink] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <HandSymbolSmall />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
                Gestus
              </span>
            </Link>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 rounded-md text-sm font-medium group"
                onMouseEnter={() => setHoverLink(link.href)}
                onMouseLeave={() => setHoverLink(null)}
              >
                <motion.div
                  className={`absolute inset-0 rounded-md ${
                    activeLink === link.href
                      ? "bg-[#ffd23f]/20"
                      : "bg-transparent"
                  }`}
                  animate={{
                    scale: hoverLink === link.href ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <span className="relative flex items-center">
                  <span className="mr-1">{link.emoji}</span>
                  <span
                    className={`${
                      activeLink === link.href
                        ? "text-[#009fe3] font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {t.nav.links[link.key]}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#009fe3] hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>{" "}
          {/* Language Toggle and Try Now Button */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <a
              href="/game"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#009fe3] hover:bg-[#0080b3] transition-colors min-w-[100px]"
            >
              {t.nav.tryNow}
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeLink === link.href
                  ? "bg-[#ffd23f]/20 text-[#009fe3]"
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#009fe3]"
              }`}
            >
              <span className="mr-2">{link.emoji}</span>
              {t.nav.links[link.key]}
            </Link>
          ))}
        </div>

        <div className="px-5 pt-2 pb-5">
          <a
            href="/game"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#009fe3] hover:bg-[#0080b3] transition-colors min-w-[100px] w-full"
          >
            {t.nav.tryNow}
          </a>
        </div>
      </div>
    </nav>
  );
}
