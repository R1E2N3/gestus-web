import LanguageSelector from '../LanguageSelector/page';
import Image from 'next/image';
import heroImg from '../../images/Hero.png';
import Nav from '../Nav/page';


export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#d6f3ff] overflow-hidden pt-0 pb-0 m-0 min-w-0">
      <Nav />
      {/* Logo and Nav are handled globally */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-black mb-4 m-4">
        Master Libras with Gestus
      </h1>
      <p className="text-lg md:text-2xl text-center text-gray-700 max-w-2xl mb-8">
        Discover the power of the Gestus method, designed for effective and fun Libras learning.
      </p>
      <a href="/prototype" className="bg-[#009fe3] hover:bg-[#007bb8] text-white font-semibold rounded-full px-8 py-3 text-lg shadow mb-12 transition">
        Get Started
      </a>
      {/* Mascot and speech bubble */}
      <div className="relative flex items-end justify-center w-full mt-4">
        {/* Mascot illustration */}
        <Image src={heroImg} alt="Gestus Mascot" width={180} height={180} className="z-0" />
      </div>
      {/* Decorative hills background */}
      <svg className="absolute bottom-0 left-0 right-0 w-screen h-40 md:h-56 lg:h-64" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path fill="#7ed957" fillOpacity="1" d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,197.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
      </svg>
    </section>
  );
} 