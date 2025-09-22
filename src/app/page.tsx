"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Shield, 
  Users, 
  Heart, 
  Brain, 
  BookOpen, 
  Globe, 
  MessageCircle, 
  Calendar, 
  Phone, 
  Star, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Lightbulb, 
  Zap, 
  Sparkles,
  ArrowDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from "lucide-react"
import Navbar from "@/components/shared/navbar"

export default function Home() {
  const { data: session } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video play failed:", error)
      })
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const features = [
    {
      icon: MessageCircle,
      title: "AI Chat Companion",
      description: "24/7 empathetic AI support that understands Indian context and culture.",
      color: "from-blue-500 to-cyan-500",
      detail: "Our AI companion is trained on cultural nuances specific to Indian students, providing relatable and empathetic conversations."
    },
    {
      icon: Calendar,
      title: "Counselor Booking",
      description: "Schedule confidential sessions with qualified mental health professionals.",
      color: "from-green-500 to-emerald-500",
      detail: "Connect with licensed counselors specializing in student mental health. Book sessions at your convenience."
    },
    {
      icon: Users,
      title: "Peer Support Forum",
      description: "Connect anonymously with fellow students facing similar challenges.",
      color: "from-purple-500 to-indigo-500",
      detail: "A safe space to share experiences and find support from peers who understand your journey."
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description: "Access articles, videos, and exercises in Hindi, English, and regional languages.",
      color: "from-orange-500 to-amber-500",
      detail: "Curated mental health resources tailored for Indian students, available in multiple languages."
    },
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your data is encrypted and anonymized. No personal information stored.",
      color: "from-red-500 to-rose-500",
      detail: "We use industry-standard encryption to ensure your conversations and data remain completely private."
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Available in 10+ Indian languages with cultural context awareness.",
      color: "from-cyan-500 to-blue-500",
      detail: "Communicate in your preferred language - Hindi, Tamil, Bengali, Telugu, Marathi, and more."
    },
    {
      icon: Brain,
      title: "Crisis Detection",
      description: "AI monitors conversations and alerts counselors during mental health emergencies.",
      color: "from-indigo-500 to-purple-500",
      detail: "Advanced algorithms detect signs of crisis and connect you with immediate help when needed."
    },
    {
      icon: Heart,
      title: "Wellness Tracking",
      description: "Monitor your mood, stress levels, and mental health progress over time.",
      color: "from-pink-500 to-rose-500",
      detail: "Track your mental wellness journey with intuitive charts and insights to understand your patterns."
    },
    {
      icon: Phone,
      title: "24/7 Emergency Support",
      description: "Immediate access to crisis helplines and emergency mental health resources.",
      color: "from-yellow-500 to-amber-500",
      detail: "One-tap access to emergency support services when you need immediate assistance."
    }
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student, Delhi",
      content: "MannSahay helped me through my toughest semester. The AI companion was there when I felt alone, and booking a counselor was so easy. Highly recommend!",
      rating: 5
    },
    {
      name: "Rahul Verma",
      role: "Medical Student, Mumbai",
      content: "As someone who struggled with anxiety, this platform has been a lifesaver. The resources in Hindi made everything so much more relatable. Thank you!",
      rating: 5
    },
    {
      name: "Ananya Patel",
      role: "Design Student, Ahmedabad",
      content: "The peer support forum made me realize I'm not alone. Connecting with others who understand my struggles has been incredibly healing.",
      rating: 4
    }
  ]

  const stats = [
    { value: "40M+", label: "Indian Students", description: "Potential beneficiaries across India" },
    { value: "60%", label: "Students Affected", description: "Report mental health challenges" },
    { value: "15%", label: "Seek Help", description: "Currently access professional support" },
    { value: "100%", label: "Confidential", description: "Your privacy is our priority" }
  ]

  const floatingElements = [
    { icon: Heart, color: "text-pink-500", size: 24, top: "10%", left: "5%", delay: 0 },
    { icon: Brain, color: "text-blue-500", size: 32, top: "20%", left: "90%", delay: 1 },
    { icon: Shield, color: "text-green-500", size: 28, top: "80%", left: "10%", delay: 2 },
    { icon: MessageCircle, color: "text-purple-500", size: 26, top: "70%", left: "85%", delay: 3 },
    { icon: BookOpen, color: "text-yellow-500", size: 30, top: "40%", left: "95%", delay: 4 },
    { icon: Users, color: "text-cyan-500", size: 22, top: "60%", left: "3%", delay: 5 }
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`absolute ${element.color} opacity-20`}
            style={{
              top: element.top,
              left: element.left,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              delay: element.delay,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <element.icon size={element.size} />
          </motion.div>
        ))}
      </div>

      {/* Video Controls */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={toggleFullscreen}
          className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/70 transition-all"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium bg-white/10 text-white border-white/20 backdrop-blur-sm mb-2"
            >
              <Heart className="mr-2 h-4 w-4 text-pink-400" />
              Mental Health Support for Indian Students
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2"
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
              className="text-lg sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed"
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
              className="text-base sm:text-lg text-gray-400 mb-4 font-medium"
            >
              &quot;तुम्हारे साथ है, हर पल।&quot;
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-block mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"></div>
              <Button
                asChild
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm relative"
              >
                <Link href={session ? "/dashboard" : "/auth/signin"} className="flex items-center">
                  {session ? "Go to Dashboard" : "Start Your Journey"}
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400 mt-6"
            >
              <div className="flex items-center">
                <Shield className="mr-2 h-3 sm:h-4 w-3 sm:w-4 text-blue-400" />
                100% Confidential
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-3 sm:h-4 w-3 sm:w-4 text-purple-400" />
                Peer Support
              </div>
              <div className="flex items-center">
                <Heart className="mr-2 h-3 sm:h-4 w-3 sm:w-4 text-pink-400" />
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
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Comprehensive Mental Health Support
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Designed specifically for Indian students with cultural sensitivity and privacy at its core.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="h-full"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full overflow-hidden group relative transition-all duration-300 ${hoveredFeature === index ? 'border-white/30' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 text-base mb-4">
                    {feature.description}
                  </p>

                  <AnimatePresence>
                    {hoveredFeature === index && (
                      <motion.p
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: "100px" }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-400 text-sm"
                      >
                        {feature.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Mental Health in India: By the Numbers
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-blue-100 max-w-2xl mx-auto"
            >
              The crisis is real, but together we can make a difference.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center h-full">
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                  <div className="text-blue-200 text-sm">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              What Our Users Say
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Real stories from Indian students who found support through MannSahay.
            </motion.p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <div className="flex flex-col items-center">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonials[activeTestimonial].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                    />
                  ))}
                </div>
                
                <motion.p
                  key={activeTestimonial}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl text-gray-200 text-center mb-8 italic"
                >
                  &quot;{testimonials[activeTestimonial].content}&quot;
                </motion.p>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-400">{testimonials[activeTestimonial].role}</div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${activeTestimonial === index ? 'bg-white scale-125' : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              How MannSahay Works
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Three simple steps to get the support you need.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                description: "Create your account with complete privacy. No personal information required.",
                icon: Users,
                detail: "Sign up using just your email - no names, no phone numbers, complete anonymity."
              },
              {
                step: 2,
                title: "Explore",
                description: "Chat with AI, browse resources, or connect with peers in the forum.",
                icon: Lightbulb,
                detail: "Discover our AI companion, resource library, and supportive community forums."
              },
              {
                step: 3,
                title: "Get Support",
                description: "Book counseling sessions or access emergency support when needed.",
                icon: Heart,
                detail: "Connect with professional counselors or access immediate crisis support."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:border-white/30">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  
                  <step.icon className="h-10 w-10 text-blue-400 mb-4 group-hover:text-blue-300 transition-colors" />
                  
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  
                  <p className="text-gray-300 mb-4 flex-grow">{step.description}</p>
                  
                  <motion.p 
                    className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0, maxHeight: 0, marginTop: 0 }}
                    animate={{ opacity: 1, maxHeight: "100px", marginTop: "0.5rem" }}
                    exit={{ opacity: 0, maxHeight: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.detail}
                  </motion.p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Advanced AI-Powered Features
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Cutting-edge technology designed for your mental wellness journey.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "Emotion Recognition",
                description: "Our AI detects subtle emotional cues in your conversations to provide better support.",
                icon: Brain,
                color: "from-purple-500 to-indigo-500"
              },
              {
                title: "Personalized Recommendations",
                description: "Get tailored resources and activities based on your unique mental health profile.",
                icon: Sparkles,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Progress Analytics",
                description: "Visualize your mental health journey with intuitive charts and insights.",
                icon: TrendingUp,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Smart Crisis Response",
                description: "Intelligent detection of crisis situations with immediate intervention protocols.",
                icon: Shield,
                color: "from-red-500 to-rose-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full flex items-start space-x-4 transition-all duration-300 group-hover:border-white/30">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} text-white flex-shrink-0`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-6"
            >
              Ready to Take Control of Your Mental Health?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-200 mb-8"
            >
              Join thousands of Indian students who are already prioritizing their mental well-being with MannSahay.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"></div>
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm relative"
              >
                <Link href={session ? "/dashboard" : "/auth/signin"} className="flex items-center">
                  {session ? "Go to Dashboard" : "Get Started for Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-8 text-gray-300"
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                100% Confidential
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                Free Forever
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-black/80 backdrop-blur-md border-t border-white/10 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/logo.png" 
                alt="MannSahay Logo" 
                className="h-10 w-10 rounded-full"
              />
              <span className="text-2xl font-bold text-white">MannSahay</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MannSahay. All rights reserved.
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              {[
                { icon: Shield, label: "Privacy" },
                { icon: BookOpen, label: "Terms" },
                { icon: MessageCircle, label: "Contact" }
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}