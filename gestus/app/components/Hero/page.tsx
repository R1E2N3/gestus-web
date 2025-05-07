import Image from 'next/image';
import LanguageSelector from '../LanguageSelector/page';
import heroImg from '../../images/Hero.png';

export default function Hero() {
  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-between py-20 px-8">
      <div className="md:w-1/2 text-center md:text-left">
        <h1 className="text-6xl font-bold accent mb-6">Pratique língua de sinais.</h1>
        <p className="text-2xl mb-8 text-[var(--foreground)]/80">Mas primeiro, escolha seu idioma:</p>
        <LanguageSelector />
      </div>
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl">
          <Image
            src={heroImg}
            alt="Hero Illustration"
            width={500}
            height={400}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
} 