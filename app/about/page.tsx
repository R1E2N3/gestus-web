"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import Image from "next/image"
import PlayfulNav from "../components/PlayfulNav"
import HandSymbol from "../components/HandSymbol"

export default function About() {
  return (
    <>
      <PlayfulNav />
      <HeroSection />
      <TeamSection />
      <MissionVisionSection />
      <TimelineSection />
      <StatisticsSection />
      <ValuesSection />
      <CallToAction />
    </>
  )
}

// Hero Section
function HeroSection() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#f0f9ff] to-white">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#ffd23f]/10 animate-float" />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#009fe3]/10 animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: "easeOut",
              },
            },
          }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            ABOUT US
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Meet the team behind{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Gestus</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#ffd23f]/30 -z-10 transform -rotate-1"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about making Brazilian sign language (Libras) accessible to everyone, bridging
            communication gaps and fostering inclusion across Brazil.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 md:p-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#ffd23f]/10 to-[#009fe3]/10 z-0" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="relative w-[180px] h-[180px] rounded-xl overflow-hidden">
                  <Image
                    src="/images/high_five.png"
                    alt="João and Renzo high-fiving after winning a competition"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Gestus was born during a late night Discord meeting where João Pedro Marques Santos and Renzo Honorato
                  were discussing science education and realized just how cut off deaf people are from that world. With
                  1% of Brazil's population being deaf or hard of hearing, we set out to create a solution.
                </p>
                <p className="text-gray-600">
                  We developed a series of games and AI models that use a person's webcam to teach them sign language,
                  making learning accessible, engaging, and fun for everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#ffd23f] rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-[#009fe3] rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}

// Mission and Vision Section
function MissionVisionSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-1/4 left-10" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" stroke="#ffd23f" strokeWidth="2" strokeDasharray="8 6" fill="none" />
        </svg>
        <svg className="absolute bottom-1/4 right-10" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" stroke="#009fe3" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-[#ffd23f] to-[#ffd23f]/70 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3">🚀</span>
                  Our Mission
                </h3>
              </div>

              <div className="p-6 relative">
                <div className="absolute top-0 right-0 opacity-10">
                  <HandSymbol size={120} animated={false} />
                </div>

                <p className="text-gray-600 mb-4 relative z-10">
                  To give every Brazilian citizen access to learning Libras (Brazilian Sign Language), fostering
                  inclusion and breaking down communication barriers for the 1% of Brazil's population that is deaf or
                  hard of hearing.
                </p>

                <ul className="space-y-3 relative z-10">
                  {[
                    "Make sign language education accessible to all",
                    "Include deaf and hard of hearing people in society",
                    "Bring sign language to every school in Brazil",
                    "Create engaging, technology-driven learning experiences",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#ffd23f] text-white flex items-center justify-center mr-3 flex-shrink-0">
                        ✓
                      </span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-[#009fe3] to-[#009fe3]/70 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3">👁️</span>
                  Our Vision
                </h3>
              </div>

              <div className="p-6 relative">
                <div className="absolute top-0 right-0 opacity-10">
                  <HandSymbol size={120} animated={false} color="#009fe3" />
                </div>

                <p className="text-gray-600 mb-4 relative z-10">
                  A Brazil where sign language is widely embraced and understood, creating a more inclusive society
                  where deaf and hard of hearing individuals have equal access to education, communication, and
                  opportunities.
                </p>

                <ul className="space-y-3 relative z-10">
                  {[
                    "Sign language education in every Brazilian school",
                    "Technology-enhanced learning for all",
                    "Inclusive communication everywhere",
                    "Celebration of deaf culture and language",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#009fe3] text-white flex items-center justify-center mr-3 flex-shrink-0">
                        ✓
                      </span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Team Section
function TeamSection() {
  const teamMembers = [
    {
      name: "João Pedro Marques Santos",
      role: "Co-Founder",
      bio: "Passionate about accessibility and education, João co-created Gestus to bridge communication gaps in Brazil.",
      color: "#ffd23f",
      linkedin: "https://www.linkedin.com/in/joão-p-m-santos/",
    },
    {
      name: "Renzo Honorato",
      role: "Co-Founder",
      bio: "Engineering undergrad at Columbia University with a vision to make sign language accessible to all Brazilians.",
      color: "#009fe3",
      linkedin: "https://www.linkedin.com/in/renzo-honorato/",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#f0f9ff] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
            OUR TEAM
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet the Founders</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The nerds behind Gestus who want to make sign language mainstream in Brazil.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-[#009fe3] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#009fe3] hover:underline"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">Our Supporters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Desafio Pioneiro", "Prequel", "Digital Promise", "TKS (The Knowledge Society)"].map(
              (supporter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-24"
                >
                  <span className="font-medium text-center">{supporter}</span>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Timeline Section
function TimelineSection() {
  const timelineEvents = [
    {
      year: "2024",
      title: "Gestus is Born",
      description:
        "João and Renzo conceive Gestus during a late night Discord meeting about science education and accessibility.",
      color: "#ffd23f",
    },
    {
      year: "2024",
      title: "Development Begins",
      description:
        "The team starts developing games and AI models to use webcams for teaching sign language interactively.",
      color: "#009fe3",
    },
    {
      year: "2024",
      title: "Competition Win",
      description: "Gestus wins the Desafio Pioneiro Competition, gaining recognition and support.",
      color: "#ffd23f",
    },
    {
      year: "2024",
      title: "Partnerships Form",
      description: "Gestus receives support from Prequel, Digital Promise, and TKS (The Knowledge Society).",
      color: "#009fe3",
    },
  ]

  return (
    <section className="py-20 bg-[#f0f9ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#ffd23f]/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#009fe3]/5 rounded-tr-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            OUR JOURNEY
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">The Gestus Timeline</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From idea to reality, our journey to revolutionize sign language learning in Brazil.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#ffd23f] to-[#009fe3]" />

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className={`flex items-center justify-center mb-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="hidden md:block w-5/12" />
                  <div className="z-10 flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.year.slice(2)}
                    </div>
                  </div>
                  <div className="hidden md:block w-5/12" />
                </div>

                <div
                  className={`flex ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center md:items-start`}
                >
                  <div className="hidden md:block md:w-5/12">
                    <div
                      className={`p-6 rounded-xl shadow-lg bg-white ${index % 2 === 0 ? "mr-8 text-right" : "ml-8"}`}
                    >
                      <div className="text-xl font-bold mb-2">{event.year}</div>
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>

                  <div className="z-10 flex-shrink-0">
                    <div className="md:hidden w-12" />
                  </div>

                  <div className="md:hidden md:w-5/12 ml-6">
                    <div className="p-6 rounded-xl shadow-lg bg-white">
                      <div className="text-xl font-bold mb-2">{event.year}</div>
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Statistics Section
function StatisticsSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
            BY THE NUMBERS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Gestus Impact</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our mission in action: making sign language accessible to everyone in Brazil.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Deaf Population in Brazil</h3>

              <div className="relative h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                    {/* Progress circle */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ffd23f"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset="248.7"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>

                    {/* Percentage text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">1%</span>
                      <span className="text-sm text-gray-500">of population</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <p className="text-gray-600">
                    1% of Brazil's population is deaf or hard of hearing, representing over 2 million people
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-6">
              <CounterCard icon="👥" value="2M+" label="Potential Users" color="#ffd23f" delay={0} />
              <CounterCard icon="🎓" value="215K+" label="Schools in Brazil" color="#009fe3" delay={0.1} />
              <CounterCard icon="🌍" value="100%" label="Inclusion Goal" color="#009fe3" delay={0.2} />
              <CounterCard icon="👋" value="1" label="Competition Won" color="#ffd23f" delay={0.3} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Counter Card Component
function CounterCard({ icon, value, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  )
}

// Values Section
function ValuesSection() {
  const values = [
    "Accessibility",
    "Innovation",
    "Inclusivity",
    "Education",
    "Community",
    "Empowerment",
    "Engagement",
    "Fun",
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#f0f9ff] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            OUR VALUES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">What We Stand For</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our core values guide everything we do at Gestus.</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              className={`px-6 py-3 rounded-full text-white font-medium shadow-md ${
                index % 2 === 0 ? "bg-[#ffd23f]" : "bg-[#009fe3]"
              }`}
            >
              {value}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-[#ffd23f]/20 flex items-center justify-center text-2xl mb-4">
              🤝
            </div>
            <h3 className="text-xl font-bold mb-3">Community-Powered</h3>
            <p className="text-gray-600">
              We believe in the power of community to drive change. Our mission is to bring sign language education to
              every school in Brazil, creating a more inclusive society.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-[#009fe3]/20 flex items-center justify-center text-2xl mb-4">
              💡
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Driven Innovation</h3>
            <p className="text-gray-600">
              We leverage cutting-edge AI and computer vision technology to create interactive games that make learning
              sign language engaging and effective.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-[#7ed957]/20 flex items-center justify-center text-2xl mb-4">
              🌱
            </div>
            <h3 className="text-xl font-bold mb-3">Educational Impact</h3>
            <p className="text-gray-600">
              We're committed to transforming education by making sign language learning accessible to all Brazilian
              citizens, starting with schools across the country.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Call to Action Section
function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#f0f9ff] to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#ffd23f]/10 animate-float" />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#009fe3]/10 animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
            JOIN US
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your sign language journey?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience the future of sign language education with Gestus. Our AI-powered platform makes learning
            accessible, engaging, and effective for every Brazilian.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <a
              href="/prototype"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#009fe3] to-[#ffd23f] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>Try Gestus Now</span>
              <svg
                className="ml-2 w-5 h-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </motion.div>

          <div className="mt-12 flex justify-center">
            <HandSymbol size={120} animated={true} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
