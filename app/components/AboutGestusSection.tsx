"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import HandSymbolSmall from "./HandSymbolSmall";

// Icon mappings for features
const featureIcons = ["👐", "📚", "🌈", "👁️", "🧠", "🎮"];
const featureColors = [
  "#ffd23f",
  "#009fe3",
  "#ffd23f",
  "#009fe3",
  "#ffd23f",
  "#009fe3",
];

export default function AboutGestusSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 bg-white relative overflow-hidden transition-all duration-700 opacity-0 translate-y-10"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#ffd23f]/5 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#009fe3]/5 transform translate-x-1/3 translate-y-1/3" />
        <svg
          className="absolute top-1/4 right-1/4"
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#ffd23f"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        </svg>
        <svg
          className="absolute bottom-1/4 left-1/4"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#009fe3"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        </svg>
      </div>

      {/* Section title */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
        <span className="inline-block px-4 py-1 bg-[#ffd23f]/10 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
          {t.aboutGestus.heading}
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {t.aboutGestus.title}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t.aboutGestus.subtitle}
        </p>
      </div>

      {/* App showcase */}
      <div className="relative z-10 max-w-6xl mx-auto mb-24">
        <div className="bg-gradient-to-br from-[#ffd23f]/10 to-[#009fe3]/10 rounded-3xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* App preview */}
            <div className="md:col-span-1 order-2 md:order-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#ffd23f]"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#009fe3]"></div>
                <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:rotate-2 transition-transform duration-300">
                  <div className="bg-gray-100 rounded-xl h-[400px] flex flex-col overflow-hidden">
                    <div className="bg-[#009fe3] text-white p-4 flex items-center">
                      <HandSymbolSmall />
                      <span className="ml-2 font-bold">Gestus App</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center">
                        <HandSymbol />
                        <p className="mt-4 text-gray-600">
                          Interactive Sign Language Learning
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex justify-around">
                      <div className="w-10 h-10 rounded-full bg-[#ffd23f] flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#009fe3] flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#7ed957] flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* App features */}
            <div className="md:col-span-2 order-1 md:order-2">
              <h3 className="text-2xl font-bold mb-6 text-center md:text-left">
                {t.aboutGestus.immersive}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {t.aboutGestus.features.slice(0, 4).map((feature, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      featureRefs.current[index] = el;
                    }}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 opacity-0 translate-y-10"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                      style={{
                        backgroundColor: `${featureColors[index]}20`,
                        color: featureColors[index],
                      }}
                    >
                      {featureIcons[index]}
                    </div>
                    <h4 className="text-lg font-bold">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="relative z-10 max-w-2xl mx-auto mt-20 text-center">
        <h3 className="text-2xl font-bold mb-6">{t.aboutGestus.cta}</h3>
        <a
          href="/prototype"
          className="inline-block px-8 py-4 bg-[#009fe3] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#0080b3] transition-colors duration-300"
        >
          {t.aboutGestus.ctaButton}
        </a>
      </div>
    </section>
  );
}

// Hand Symbol SVG Component
function HandSymbol() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 196 282"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M67 274.449C48.5 274.449 37.5 267.5 37.5 267.5C37.5 267.5 5.7831 250.949 10.7831 193.449C5.2831 173.949 -0.216904 128.949 40.7831 134.449C47.0757 110.247 73.5183 117.909 78.8284 121.599C79.0034 121.72 79.1555 121.838 79.2831 121.949C84.1164 113.449 97.3812 101.151 111.783 119.949C113.315 121.949 111.783 33.4489 123.283 15.9489C128.212 8.44805 133.5 7 137.5 7C141.5 7 150.642 10.2252 151.283 18.9487L153.783 126.949C165.783 97.9488 191.783 101.449 187.783 126.949C187.783 129.449 182.383 137.749 184.783 204.949C184.783 237.949 167.783 274.449 119.283 274.449"
        stroke="#009FE3"
        stroke-width="14"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
