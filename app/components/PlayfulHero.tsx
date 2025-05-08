"use client"

import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { useTranslation } from "../hooks/useTranslation"
import { useLanguage } from "../contexts/LanguageContext"
import PlayfulCTA from "./PlayfulCTA"
import HandSign from "./HandSign"
import WaveBackground from "./WaveBackground"
import AnimatedEyes from "./AnimatedEyes"

export default function PlayfulHero() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const t = useTranslation()
  const { language } = useLanguage()
  const [scrollY, setScrollY] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % t.hero.words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [t.hero.words.length])

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-b from-white to-[#f8f9fa]">
      <WaveBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
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
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
                {t.hero.title}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t.hero.subtitle}
              </h1>
              <div className="flex justify-center items-center mb-8">
                <div className="flex items-center">
                  <span className="text-xl text-gray-600 mr-2">{t.hero.makeIt}</span>
                  <div className="w-32 h-10 relative">
                    <motion.span
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-2xl font-bold text-[#009fe3] absolute left-0"
                    >
                      {t.hero.words[currentWordIndex]}
                    </motion.span>
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <a
                  href="/prototype"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#009fe3] to-[#ffd23f] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t.hero.cta}
                  <svg
                    className="ml-2 w-5 h-5 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              className="relative z-10 bg-white rounded-3xl shadow-xl p-6 md:p-10"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ transformOrigin: "center center" }}
              whileHover={{ rotate: -2, scale: 1.02 }}
            >
              <div className="aspect-w-4 aspect-h-3 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffd23f]/20 to-[#009fe3]/20 rounded-lg overflow-hidden">
                  {/* Animated hand signs */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute" style={{ top: "10%", left: "20%" }}>
                      <HandSign size={120} animated={true} />
                    </div>
                    <div className="absolute" style={{ top: "60%", left: "70%" }}>
                      <HandSign
                        size={80}
                        animated={true}
                        color="#009fe3"
                      />
                    </div>
                    <div className="absolute" style={{ top: "30%", left: "60%" }}>
                      <HandSign
                        size={60}
                        animated={true}
                        color="#009fe3"
                      />
                    </div>

                    {/* Animated text */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <h3 className="text-2xl font-bold text-gray-800">Learn Sign Language</h3>
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
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -5, backgroundColor: "#ffd23f20" }}
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div className="mt-2 text-sm font-medium text-gray-700">{feature.label}</div>
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
              className="absolute -bottom-4 -left-4 w-8 h-8 bg-[#009fe3] rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            />
          </div>
        </div>
      </div>

      {/* Animated eyes that follow cursor */}

      {/* Green ellipse for smooth transition */}
      <div className="absolute -bottom-20 left-0 right-0 z-0 overflow-hidden">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none" 
          width="100%" 
          height="120"
        >
          <motion.ellipse 
            cx="720" 
            cy="60" 
            rx="720" 
            ry="120" 
            fill="#7ed957"
            initial={{ scaleX: 0.8, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="100%" height="320">
          <motion.path
            d="M0,96L48,106.7C96,117,192,139,288,154.7C384,171,480,181,576,170.7C672,160,768,128,864,122.7C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#7ed957"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>
    </section>
  )
}
