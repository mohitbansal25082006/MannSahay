"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

export default function HeroSection() {
  const { data: session } = useSession()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const calculateTransform = (index: number) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }
    
    const speed = index + 1
    const x = (mousePosition.x - windowSize.width / 2) / speed
    const y = (mousePosition.y - windowSize.height / 2) / speed
    return { x, y }
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating 3D Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: calculateTransform(0).x,
            y: calculateTransform(0).y,
            scale: [1, 1.1, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
            scale: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: calculateTransform(1).x,
            y: calculateTransform(1).y,
            scale: [1, 1.2, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            scale: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: calculateTransform(2).x,
            y: calculateTransform(2).y,
            scale: [1, 1.15, 1],
          }}
          transition={{
            type: "spring",
            stiffness: 45,
            damping: 22,
            scale: {
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]" />

        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-white/10 text-white border-white/20 mb-8 backdrop-blur-sm"
          >
            <Heart className="mr-2 h-4 w-4 text-pink-400" />
            Mental Health Support for Indian Students
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          >
            Your Mind Matters.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Always.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered mental health companion designed for Indian students.
            Get support, book counseling, and connect with peers - all in a safe,
            confidential environment.
          </motion.p>

          {/* Hindi Tagline */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-gray-400 mb-12 font-medium"
          >
            "तुम्हारे साथ है, हर पल।"
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
            >
              <Link href={session ? "/dashboard" : "/auth/signin"} className="flex items-center">
                {session ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 mt-16"
          >
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-400" />
              100% Confidential
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-purple-400" />
              Peer Support
            </div>
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4 text-pink-400" />
              Crisis Support 24/7
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 1.5, delay: 1, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  )
}