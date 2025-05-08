"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  
  // Determine if the toggle is in the "on" (Portuguese) position
  const isOn = language === "pt"

  return (
    <div 
      onClick={toggleLanguage}
      className="cursor-pointer w-16 h-8 flex items-center"
    >
      {/* Gray track for the ball to move in */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full shadow-inner">
        {/* Moving ball with flag */}
        <motion.div
          initial={false}
          animate={{ x: isOn ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
        >
          <span className="text-xs">
            {isOn ? "🇧🇷" : "🇺🇸"}
          </span>
        </motion.div>
      </div>
    </div>
  )
} 