"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
    >
      {language === "en" ? (
        <>
          <span>🇧🇷</span>
          <span className="text-sm font-medium">PT</span>
        </>
      ) : (
        <>
          <span>🇺🇸</span>
          <span className="text-sm font-medium">EN</span>
        </>
      )}
    </motion.button>
  )
} 