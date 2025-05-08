"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface EyeProps {
  x: number
  y: number
  delay: number
  size?: number
}

const Eye = ({ x, y, delay, size = 30 }: EyeProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const calculatePupilPosition = () => {
    const eyeRect = { x, y, width: size, height: size }
    const dx = mousePosition.x - (eyeRect.x + eyeRect.width / 2)
    const dy = mousePosition.y - (eyeRect.y + eyeRect.height / 2)
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = size / 4
    const normalizedDistance = Math.min(distance, maxDistance)
    const angle = Math.atan2(dy, dx)

    return {
      x: Math.cos(angle) * normalizedDistance,
      y: Math.sin(angle) * normalizedDistance,
    }
  }

  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div
        className="rounded-full bg-white border-2 border-[#009fe3] flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <motion.div
          className="rounded-full bg-[#009fe3]"
          style={{ width: size / 2.5, height: size / 2.5 }}
          animate={calculatePupilPosition}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </motion.div>
  )
}

export default function AnimatedEyes() {
  return (
    <>
      <Eye x={400} y={300} delay={0.5} size={30} />
      <Eye x={450} y={300} delay={0.6} size={30} />
      <Eye x={700} y={200} delay={0.8} size={25} />
      <Eye x={740} y={200} delay={0.9} size={25} />
    </>
  )
}
