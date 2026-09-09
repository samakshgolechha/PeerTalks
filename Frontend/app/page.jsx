import Hero from "@/components/LandingPage/Hero";
import CursorDotTrail from "@/components/LandingPage/CursorDotTrail";
// import Desc from "@/components/LandingPage/Desc";
// import Features from "@/components/LandingPage/Features";

export default function Home() {
  return (
    <>
      <CursorDotTrail color="#c084fc" size={10} hoverSize={25} />
      <Hero />
      {/* More sections coming soon */}
    </>
  );
}
