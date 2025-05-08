"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  
  return (
    <motion.button
      onClick={toggleLanguage}
      className="text-xl cursor-pointer focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.span
        key={language}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'inline-block' }}
      >
        {language === "en" ? "🇺🇸" : "🇧🇷"}
      </motion.span>
    </motion.button>
  )
} 