import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import StatsSection from "@/components/landing/stats-section"
import Footer from "@/components/landing/footer"
import Navbar from "@/components/shared/navbar"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </main>
  )
}