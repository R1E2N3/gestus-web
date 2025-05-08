"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

export default function PlayfulCTA() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-0.5 rounded-full opacity-70 blur-sm"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      />
      <Link href="/prototype">
        <motion.button
          className="relative px-8 py-3 bg-white rounded-full font-bold text-lg shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
            Start Learning Now
          </span>
          <motion.span
            className="ml-2"
            animate={{ rotate: isHovered ? [0, -10, 10, -5, 5, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            👋
          </motion.span>
        </motion.button>
      </Link>
    </div>
  )
}
