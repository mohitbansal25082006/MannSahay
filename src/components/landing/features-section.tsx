"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  BookOpen, 
  Shield, 
  Globe,
  Brain,
  Heart,
  Phone
} from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat Companion",
    description: "24/7 empathetic AI support that understands Indian context and culture.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Calendar,
    title: "Counselor Booking",
    description: "Schedule confidential sessions with qualified mental health professionals.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Peer Support Forum",
    description: "Connect anonymously with fellow students facing similar challenges.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    description: "Access articles, videos, and exercises in Hindi, English, and regional languages.",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Your data is encrypted and anonymized. No personal information stored.",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in 10+ Indian languages with cultural context awareness.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: Brain,
    title: "Crisis Detection",
    description: "AI monitors conversations and alerts counselors during mental health emergencies.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Heart,
    title: "Wellness Tracking",
    description: "Monitor your mood, stress levels, and mental health progress over time.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Phone,
    title: "24/7 Emergency Support",
    description: "Immediate access to crisis helplines and emergency mental health resources.",
    color: "from-yellow-500 to-amber-500"
  }
]

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="h-full"
    >
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 h-full overflow-hidden group relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        <CardHeader className="relative">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
            <Icon className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
            {feature.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
            {feature.description}
          </CardDescription>
        </CardContent>
        
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
      </Card>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="features" className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            ref={ref}
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Comprehensive Mental Health Support
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Designed specifically for Indian students with cultural sensitivity and privacy at its core.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
