"use client"

import { motion } from "framer-motion"
import { CSSProperties } from "react"

interface HandSymbolProps {
  size?: number
  animated?: boolean
  color?: string
  className?: string
  style?: CSSProperties
}

export default function HandSymbol({ 
  size = 100, 
  animated = true, 
  color = "#ffd23f", 
  className = "",
  style = {} 
}: HandSymbolProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Palm */}
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
        initial={animated ? { scale: 0.8 } : { scale: 1 }}
        animate={animated ? { scale: [0.8, 1, 0.8] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Fingers */}
      <motion.path
        d="M50 20 L50 5"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        initial={animated ? { opacity: 0.6 } : { opacity: 1 }}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.path
        d="M65 25 L75 15"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        initial={animated ? { opacity: 0.6 } : { opacity: 1 }}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
      />
      <motion.path
        d="M75 40 L90 35"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        initial={animated ? { opacity: 0.6 } : { opacity: 1 }}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
      />
      <motion.path
        d="M35 25 L25 15"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        initial={animated ? { opacity: 0.6 } : { opacity: 1 }}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
      />
      <motion.path
        d="M25 40 L10 35"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        initial={animated ? { opacity: 0.6 } : { opacity: 1 }}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.8 }}
      />
    </svg>
  )
}
