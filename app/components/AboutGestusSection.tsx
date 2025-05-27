"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";

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
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#ffd23f]/5 transform -translate-x-1/2" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#009fe3]/5 transform translate-x-1/3 translate-y-1/4" />
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
          className="absolute bottom-1/2 left-1/4"
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

      {/* Call to action */}
      <div className="relative z-10 max-w-2xl mx-auto mt-20 text-center">
        <h3 className="text-2xl font-bold mb-6">{t.aboutGestus.cta}</h3>
        <a
          href="/game"
          className="inline-block px-8 py-4 bg-[#009fe3] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#0080b3] transition-colors duration-300"
        >
          {t.aboutGestus.ctaButton}
        </a>
      </div>
    </section>
  );
}
