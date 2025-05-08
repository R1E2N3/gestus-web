"use client"

import { motion } from "framer-motion"
import { CSSProperties } from "react"

interface HandSignProps {
  className?: string
  size?: number
  color?: string
  animated?: boolean
  style?: CSSProperties
}

export default function HandSign({ 
  className = "", 
  size = 60, 
  color = "#ffd23f", 
  animated = true,
  style = {}
}: HandSignProps) {
  const combinedStyle: CSSProperties = {
    width: size,
    height: size,
    ...style
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={combinedStyle}
      whileHover={animated ? { rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Hand shape */}
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M50,10 C60,10 70,15 75,25 C80,35 80,45 75,55 C70,65 60,70 50,70 C40,70 30,65 25,55 C20,45 20,35 25,25 C30,15 40,10 50,10 Z"
          fill={color}
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        {/* Fingers */}
        <motion.path
          d="M50,70 L50,90 M40,70 L35,85 M60,70 L65,85 M30,55 L15,60 M70,55 L85,60"
          stroke="#009fe3"
          strokeWidth="4"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  )
}
