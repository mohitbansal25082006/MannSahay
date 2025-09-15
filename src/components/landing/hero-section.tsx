import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Users } from "lucide-react"
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-background dark:to-cyan-950">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20 mb-8">
            <Heart className="mr-2 h-4 w-4" />
            Mental Health Support for Indian Students
          </div>
          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Your Mind Matters.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Always.
            </span>
          </h1>
          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered mental health companion designed for Indian students. 
            Get support, book counseling, and connect with peers - all in a safe, 
            confidential environment.
          </p>
          {/* Hindi Tagline */}
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium">
            "तुम्हारे साथ है, हर पल।"
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link href="/auth/signin" className="flex items-center">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              100% Confidential
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Peer Support
            </div>
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              Crisis Support 24/7
            </div>
          </div>
        </div>
      </div>
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-blue-800"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-cyan-800"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-pink-800"></div>
    </section>
  )
}