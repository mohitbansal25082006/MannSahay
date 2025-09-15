import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import StatsSection from "@/components/landing/stats-section"
import Footer from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </main>
  )
}