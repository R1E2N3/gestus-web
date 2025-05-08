import Nav from "../Nav/page"
import ScrollingWords from "../ScrollingWords"

export default function Hero() {
  // Words to animate
  const words = ["Fun", "Interactive", "Engaging", "Playful", "Educational"]

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#d6f3ff] overflow-hidden pt-16 pb-0 m-0 min-w-0">
      <div className="absolute top-0 left-0 w-full">
        <Nav />
      </div>
      {/* Logo and Nav are handled globally */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-black mb-4 m-4">
        Master Libras with Gestus
      </h1>
      <div className="text-lg md:text-2xl text-center text-gray-700 max-w-2xl">
        <p>Discover the power of sign language through our</p>
        <ScrollingWords words={words} highlightColor="#009fe3" />
        <p>learning platform designed for everyone.</p>
      </div>
      <a
        href="/prototype"
        className="bg-[#009fe3] hover:bg-[#007bb8] text-white font-semibold rounded-full px-8 py-3 text-lg shadow mb-12 transition mt-8"
      >
        Get Started
      </a>
      {/* Mascot and speech bubble */}
      <div className="relative flex items-end justify-center w-full mt-4 mb-12 z-10">
        {/* Placeholder for mascot */}
        <div className="w-[180px] h-[180px] bg-[#ffd23f] rounded-full flex items-center justify-center text-white font-bold text-xl z-10 relative">
          <HandSymbol />
        </div>
      </div>
      {/* Learn more arrow button */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-col items-center z-20 ">
        <button className="flex flex-col items-center group focus:outline-none">
          <span className="bg-white rounded-full p-2 shadow-lg mb-2 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 5v14M12 19l-5-5M12 19l5-5"
                stroke="#7ed957"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-white font-semibold text-base drop-shadow">Learn more about us</span>
        </button>
      </div>
      {/* Decorative hills background */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-screen h-64 md:h-80 lg:h-[28rem]"
        viewBox="0 0 1440 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          fill="#7ed957"
          fillOpacity="1"
          d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,197.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,580L1380,580C1320,580,1200,580,1080,580C960,580,840,580,720,580C600,580,480,580,360,580C240,580,120,580,60,580L0,580Z"
        />
      </svg>
      {/* Rounded white transition to next section */}
      <svg
        className="absolute bottom-[-32px] left-0 right-0 w-screen h-16 z-30"
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <ellipse cx="720" cy="40" rx="720" ry="40" fill="#fff" />
      </svg>
    </section>
  )
}

// Hand Symbol SVG Component
function HandSymbol() {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
