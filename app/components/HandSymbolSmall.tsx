"use client"

import { motion } from "framer-motion"

export default function HandSymbolSmall() {
  return (
    <motion.div
      whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
      transition={{ duration: 0.5 }}
      className="w-10 h-10 rounded-full bg-[#ffd23f] flex items-center justify-center text-white font-bold text-xl"
    >
      G
    </motion.div>
  )
} 