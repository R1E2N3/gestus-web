"use client"

import { useEffect, useRef, useState } from "react"

interface ScrollingWordsProps {
  words: string[]
  highlightColor?: string
}

export default function ScrollingWords({ words, highlightColor = "#009fe3" }: ScrollingWordsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % words.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible, words.length])

  return (
    <div ref={containerRef} className="relative h-12 overflow-hidden my-2">
      {words.map((word, index) => (
        <div
          key={word}
          className="absolute w-full transition-all duration-500 ease-in-out flex justify-center"
          style={{
            transform: `translateY(${(index - activeIndex) * 100}%)`,
            opacity: index === activeIndex ? 1 : 0,
          }}
        >
          <span className="font-bold text-2xl" style={{ color: highlightColor }}>
            {word}
          </span>
        </div>
      ))}
    </div>
  )
}
