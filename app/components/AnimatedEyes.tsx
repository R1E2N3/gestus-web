"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimate } from "framer-motion"

interface EyeProps {
  x: number
  y: number
  delay: number
  size?: number
}

interface PupilPosition {
  x: number
  y: number
}

const Eye = ({ x, y, delay, size = 30 }: EyeProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scope, animate] = useAnimate()
  const isAnimating = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (isAnimating.current) return;
    
    const eyeRect = { x, y, width: size, height: size }
    const dx = mousePosition.x - (eyeRect.x + eyeRect.width / 2)
    const dy = mousePosition.y - (eyeRect.y + eyeRect.height / 2)
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = size / 4
    const normalizedDistance = Math.min(distance, maxDistance)
    const angle = Math.atan2(dy, dx)
    
    const pupilX = Math.cos(angle) * normalizedDistance
    const pupilY = Math.sin(angle) * normalizedDistance
    
    isAnimating.current = true
    
    animate(scope.current, { 
      x: pupilX, 
      y: pupilY 
    }, { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      onComplete: () => {
        isAnimating.current = false
      }
    })
  }, [mousePosition, x, y, size, animate, scope])

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
          ref={scope}
          className="rounded-full bg-[#009fe3]"
          style={{ width: size / 2.5, height: size / 2.5 }}
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
