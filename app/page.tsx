import PlayfulHero from "./components/PlayfulHero";
import PlayfulNav from "./components/PlayfulNav";
import AboutGestusSection from "./components/AboutGestusSection";
import GestusInSchoolsSection from "./components/GestusInSchoolsSection";

export default function HomePage() {
  return (
    <>
      <PlayfulNav />
      <PlayfulHero />
      <AboutGestusSection />
    </>
  );
}
