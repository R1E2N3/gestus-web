"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import HandSymbol from "./HandSymbol"
import { useTranslation } from "../hooks/useTranslation"

export default function GestusInSchoolsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 })
  const t = useTranslation()

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#ffd23f]/5 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#009fe3]/5 transform translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/10 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            {t.schools.heading}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.schools.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.schools.subtitle}
          </p>
        </motion.div>

        {/* Image grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="/images/joao_gestus.png"
                  alt="João teaching sign language at a school using Gestus"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t.schools.joaoCard.title}</h3>
                <p className="text-gray-600">
                  {t.schools.joaoCard.description}
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#ffd23f] rounded-full" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#009fe3] rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="/images/renzo_gestus.png"
                  alt="Renzo teaching sign language at a school using Gestus"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t.schools.renzoCard.title}</h3>
                <p className="text-gray-600">
                  {t.schools.renzoCard.description}
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#009fe3] rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-[#ffd23f] rounded-full" />
          </motion.div>
        </div>

        {/* Impact stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-[#ffd23f]/10 to-[#009fe3]/10 rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#ffd23f] mb-2">{t.schools.mission}</div>
              <p className="text-gray-700">
                {t.schools.missionText}
              </p>
            </div>

            <div className="flex justify-center">
              <HandSymbol size={120} animated={true} />
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-[#009fe3] mb-2">{t.schools.join}</div>
              <p className="text-gray-700">
                {t.schools.joinText}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
