import { About } from "@/components/landing/About";
import { Bracket } from "@/components/landing/Bracket";
import { Categories } from "@/components/landing/Categories";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Navbar } from "@/components/landing/Navbar";
import { getPublicBracket, getPublicStats } from "@/lib/supabase/public";

export const revalidate = 30;

export default async function HomePage() {
  const [stats, bracket] = await Promise.all([getPublicStats(), getPublicBracket()]);
  return (
    <>
      <Navbar />
      <main>
        <Hero stats={stats} />
        <Marquee />
        <About />
        <Categories />
        <Bracket rows={bracket} />
      </main>
      <Footer />
    </>
  );
}
