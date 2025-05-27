"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { language } = useLanguage();
  const t = translations[language].footer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
                Gestus
              </span>
            </div>
            <p className="text-gray-600 mb-4">{t.about}</p>
            <div className="flex space-x-4">
              <Link href="https://twitter.com">
                <div className="h-10 w-10 rounded-full bg-[#009fe3] flex items-center justify-center text-white hover:bg-[#0080b4] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </div>
              </Link>
              <Link href="https://facebook.com">
                <div className="h-10 w-10 rounded-full bg-[#009fe3] flex items-center justify-center text-white hover:bg-[#0080b4] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </div>
              </Link>
              <Link href="https://instagram.com">
                <div className="h-10 w-10 rounded-full bg-[#009fe3] flex items-center justify-center text-white hover:bg-[#0080b4] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {t.quickLinks}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.aboutUs}
                </Link>
              </li>
              <li>
                <Link
                  href="/our-solution"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.ourSolution}
                </Link>
              </li>
              <li>
                <Link
                  href="/contribute"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.contribute}
                </Link>
              </li>
              <li>
                <Link
                  href="/prototype"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.tryPrototype}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {t.support}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.faq}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-[#009fe3] transition-colors"
                >
                  {t.termsOfService}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {t.stayUpdated}
            </h3>
            <p className="text-gray-600 mb-4">{t.newsletterText}</p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-full border border-gray-300 bg-background px-3 py-2 text-base focus:border-[#009fe3] focus:outline-none focus:ring-2 focus:ring-[#009fe3] focus:ring-opacity-50"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#009fe3] p-2 text-white hover:bg-[#0080b4] transition-colors"
                >
                  {/* Simple paper airplane icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            {t.copyright.replace("{year}", currentYear.toString())}
          </p>
          {/* <p className="text-xs text-gray-400 mt-2">
            {t.legalText}
          </p> */}
        </div>
      </div>
    </footer>
  );
}
