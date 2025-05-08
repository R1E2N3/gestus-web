"use client"

import { motion } from "framer-motion"

export default function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Top wave */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-64 bg-[#009fe3]/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1 }}
      >
        <svg
          className="absolute bottom-0 w-full h-20"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="#ffffff"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Bottom wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-64 bg-[#ffd23f]/10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1 }}
      >
        <svg
          className="absolute top-0 w-full h-20 transform rotate-180"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="#ffffff"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Floating circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#ffd23f]/10"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#009fe3]/10"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-[#ffd23f]/5"
        animate={{
          y: [0, -15, 0],
          x: [0, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 0.5,
        }}
      />
    </div>
  )
}
