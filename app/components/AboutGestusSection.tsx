"use client"

import { useEffect, useRef } from "react"

// Feature data with improved content and icons
const features = [
  {
    id: 1,
    title: "Learn all the signs from the ground up",
    description: "in your own pace",
    icon: "👐",
    color: "#ffd23f",
  },
  {
    id: 2,
    title: "Hundreds of interactive lessons",
    description: "talk to AI, practice with friends, grind the games to earn points.",
    icon: "📚",
    color: "#009fe3",
  },
  {
    id: 3,
    title: "Accessible to everyone",
    description: "children and adults, high school and university. Give sign language a try!",
    icon: "🌈",
    color: "#ffd23f",
  },
  {
    id: 4,
    title: "Form association easily",
    description: "with intuitive visual cues",
    icon: "👁️",
    color: "#009fe3",
  },
  {
    id: 5,
    title: "Support both learning styles",
    description: "visual and interactive",
    icon: "🧠",
    color: "#ffd23f",
  },
  {
    id: 6,
    title: "Stay motivated with",
    description: "interactive games and challenges",
    icon: "🎮",
    color: "#009fe3",
  },
]

export default function AboutGestusSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 bg-white relative overflow-hidden transition-all duration-700 opacity-0 translate-y-10"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#ffd23f]/5 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#009fe3]/5 transform translate-x-1/3 translate-y-1/3" />
        <svg
          className="absolute top-1/4 right-1/4"
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="40" stroke="#ffd23f" strokeWidth="2" strokeDasharray="6 4" />
        </svg>
        <svg
          className="absolute bottom-1/4 left-1/4"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="40" stroke="#009fe3" strokeWidth="2" strokeDasharray="6 4" />
        </svg>
      </div>

      {/* Section title */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
        <span className="inline-block px-4 py-1 bg-[#ffd23f]/10 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
          LEARN WITH GESTUS
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Simplify your Libras learning journey with{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Gestus</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-[#ffd23f]/30 -z-10 transform -rotate-1"></span>
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Our interactive platform makes learning sign language fun, engaging, and effective for everyone.
        </p>
      </div>

      {/* App showcase */}
      <div className="relative z-10 max-w-6xl mx-auto mb-24">
        <div className="bg-gradient-to-br from-[#ffd23f]/10 to-[#009fe3]/10 rounded-3xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* App preview */}
            <div className="md:col-span-1 order-2 md:order-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#ffd23f]"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#009fe3]"></div>
                <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:rotate-2 transition-transform duration-300">
                  <div className="bg-gray-100 rounded-xl h-[400px] flex flex-col overflow-hidden">
                    <div className="bg-[#009fe3] text-white p-4 flex items-center">
                      <HandSymbolSmall />
                      <span className="ml-2 font-bold">Gestus App</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center">
                        <HandSymbol />
                        <p className="mt-4 text-gray-600">Interactive Sign Language Learning</p>
                      </div>
                    </div>
                    <div className="p-4 flex justify-around">
                      <div className="w-10 h-10 rounded-full bg-[#ffd23f] flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#009fe3] flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#7ed957] flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* App features */}
            <div className="md:col-span-2 order-1 md:order-2">
              <h3 className="text-2xl font-bold mb-6 text-center md:text-left">
                Designed for an immersive learning experience
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.slice(0, 4).map((feature, index) => (
                  <div
                    key={feature.id}
                    ref={(el) => { featureRefs.current[index] = el; }}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 opacity-0 translate-y-10"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                      style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                    >
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-bold">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="relative z-10 max-w-2xl mx-auto mt-20 text-center">
        <h3 className="text-2xl font-bold mb-6">Ready to start your learning journey?</h3>
        <a
          href="/prototype"
          className="inline-block px-8 py-4 bg-[#009fe3] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#0080b3] transition-colors duration-300"
        >
          Try Gestus Now
        </a>
      </div>
    </section>
  )
}

// Hand Symbol SVG Component
function HandSymbol() {
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Palm */}
      <circle cx="50" cy="50" r="30" fill="#ffd23f" stroke="#ffffff" strokeWidth="2" />

      {/* Fingers */}
      <path d="M50 20 L50 5" stroke="#009fe3" strokeWidth="8" strokeLinecap="round" className="animate-pulse" />
      <path
        d="M65 25 L75 15"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.1s" }}
      />
      <path
        d="M75 40 L90 35"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.2s" }}
      />
      <path
        d="M35 25 L25 15"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.3s" }}
      />
      <path
        d="M25 40 L10 35"
        stroke="#009fe3"
        strokeWidth="8"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.4s" }}
      />
    </svg>
  )
}

// Smaller Hand Symbol for UI elements
function HandSymbolSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Palm */}
      <circle cx="50" cy="50" r="30" fill="#ffffff" />

      {/* Fingers */}
      <path d="M50 20 L50 5" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M65 25 L75 15" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M75 40 L90 35" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M35 25 L25 15" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M25 40 L10 35" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}
