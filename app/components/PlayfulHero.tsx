"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../contexts/LanguageContext";
import PlayfulCTA from "./PlayfulCTA";
import HandSign from "./HandSign";
import WaveBackground from "./WaveBackground";
import AnimatedEyes from "./AnimatedEyes";

export default function PlayfulHero() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const t = useTranslation();
  const { language } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % t.hero.words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [t.hero.words.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-[#f8f9fa]">
      {/* Colorful circles */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-[#000000]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-[#ffd23f]/10 rounded-full blur-3xl" />
      </div>{" "}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          <div className="flex flex-col justify-center">
            <motion.div
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: "easeOut",
                  },
                },
              }}
              className="text-center lg:text-left"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4"
              >
                {t.hero.title}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                {t.hero.subtitle}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex justify-center lg:justify-start items-center mb-8"
              >
                <div className="flex items-center">
                  <div className="text-xl text-gray-600 mr-2">
                    {t.hero.makeIt}
                  </div>

                  <div className="relative">
                    <motion.div
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-xl font-bold text-[#009fe3]"
                    >
                      {t.hero.words[currentWordIndex]}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="/prototype"
                  className="inline-flex items-center px-8 py-4 bg-[#009fe3] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t.hero.cta}
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>{" "}
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative flex  mx-auto lg:ml-auto">
            <motion.div
              className="relative z-10 bg-white rounded-3xl shadow-xl p-6 md:p-10 max-w-lg w-full"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ transformOrigin: "center center" }}
              whileHover={{ rotate: -2, scale: 1.02 }}
            >
              <div className="aspect-w-4 aspect-h-3 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/20 to-[#009fe3]/20 rounded-lg overflow-hidden">
                  {/* Animated hand signs */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute"
                      style={{ top: "10%", left: "20%" }}
                    >
                      <HandSign size={120} animated={true} />
                    </div>
                    <div
                      className="absolute"
                      style={{ top: "60%", left: "70%" }}
                    >
                      <HandSign size={80} animated={true} color="#009fe3" />
                    </div>
                    <div
                      className="absolute"
                      style={{ top: "30%", left: "60%" }}
                    >
                      <HandSign size={60} animated={true} color="#009fe3" />
                    </div>

                    {/* Animated text */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <h3 className="text-2xl font-bold text-gray-800">
                        Learn Sign Language
                      </h3>
                      <p className="mt-2 text-gray-600">Interactive & Fun</p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* App features preview */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { icon: "👋", label: "Learn signs" },
                  { icon: "🎮", label: "Play Games to memorize" },
                  { icon: "🧠", label: "Practice with AI" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    className="bg-gray-50 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -5, backgroundColor: "#ffd23f20" }}
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div className="mt-2 text-sm font-medium text-gray-700">
                      {feature.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-12 h-12 bg-[#ffd23f] rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            />
            <motion.div
              className="absolute -bottom-3 -left-3 w-8 h-8 bg-[#009fe3] rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            />
          </div>
        </div>
      </div>
      {/* Bouncing arrow */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{
          y: [0, 10, 0],
          opacity: scrollY > 100 ? 0 : 1,
        }}
        transition={{
          y: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          opacity: {
            duration: 0.3,
            ease: "easeInOut",
          },
        }}
      >
        <svg
          className="w-8 h-8 text-[#009fe3]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}
