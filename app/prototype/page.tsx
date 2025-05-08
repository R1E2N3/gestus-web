"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import PlayfulNav from "../components/PlayfulNav"
import HandSymbol from "../components/HandSymbol"

export default function PrototypePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [currentSign, setCurrentSign] = useState("Hello 👋")

  // This would be implemented later - just UI for now
  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
      <PlayfulNav />
      
      <main className="container mx-auto px-4 pt-24 pb-10 max-w-5xl">
        <div className="flex flex-col items-center">
          {/* Page title */}
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gestus <span className="bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">Prototype</span>
          </motion.h1>
          
          {/* Current sign to make */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 w-full max-w-2xl text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl text-gray-500 mb-2">Please sign:</h2>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
              {currentSign}
            </h1>
          </motion.div>

          {/* Video input area */}
          <motion.div
            className="relative w-full max-w-2xl aspect-video mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-[#009fe3]/30 bg-[#f0f9ff] flex items-center justify-center overflow-hidden">
              {/* Placeholder for video feed */}
              <div className="text-center px-6">
                <HandSymbol size={120} animated={true} />
                <p className="text-gray-500 mt-4">
                  {isRecording 
                    ? "Recording... Make your sign now!" 
                    : "Your camera feed will appear here"}
                </p>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" />
                  <span className="text-red-500 font-medium">REC</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              className={`px-8 py-3 rounded-full font-bold text-white shadow-lg flex items-center ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-[#009fe3] hover:bg-[#0084bd]"
              }`}
              onClick={toggleRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="6" y="6" width="8" height="8" fill="currentColor" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="6" fill="currentColor" />
                  </svg>
                )}
              </span>
              {isRecording ? "Stop Recording" : "Start Recording"}
            </motion.button>

            <motion.button
              className="px-8 py-3 rounded-full font-bold text-white bg-[#ffd23f] hover:bg-[#f2c935] shadow-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!isRecording}
              style={{ opacity: isRecording ? 1 : 0.5 }}
            >
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              Send Video
            </motion.button>
          </motion.div>

          {/* Hint section */}
          <motion.div
            className="mt-12 bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-[#009fe3]/20 text-[#009fe3] flex items-center justify-center mr-3">
                💡
              </span>
              How It Works
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  1
                </span>
                <span>Press "Start Recording" and perform the sign shown above</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  2
                </span>
                <span>Stop the recording when you're done</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  3
                </span>
                <span>Send your video to get instant feedback on your sign</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 z-[-1] overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="100%" height="320">
          <path
            d="M0,96L48,106.7C96,117,192,139,288,154.7C384,171,480,181,576,170.7C672,160,768,128,864,122.7C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#7ed957"
            opacity="0.2"
          />
        </svg>
      </div>
    </div>
  )
}
