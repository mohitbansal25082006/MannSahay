"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Heart, MessageSquare, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

const stats = [
  {
    icon: Users,
    value: 40,
    suffix: "M+",
    label: "Indian Students",
    description: "Potential beneficiaries across India"
  },
  {
    icon: Heart,
    value: 60,
    suffix: "%",
    label: "Students Affected",
    description: "Report mental health challenges"
  },
  {
    icon: MessageSquare,
    value: 15,
    suffix: "%",
    label: "Seek Help",
    description: "Currently access professional support"
  },
  {
    icon: Shield,
    value: 100,
    suffix: "%",
    label: "Confidential",
    description: "Your privacy is our priority"
  }
]

const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [count, setCount] = useState(0)
  const Icon = stat.icon

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = stat.value
      const duration = 2000 // ms
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.ceil(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    }
  }, [inView, stat.value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="bg-white/10 backdrop-blur-sm border-0 text-white h-full overflow-hidden relative">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Icon className="h-8 w-8 text-blue-200" />
          </div>
          <div className="text-4xl font-bold mb-2">
            {count}{stat.suffix}
          </div>
          <div className="text-lg font-semibold mb-1">{stat.label}</div>
          <div className="text-blue-100 text-sm">{stat.description}</div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
      </Card>
    </motion.div>
  )
}

export default function StatsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            ref={ref}
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Mental Health in India: By the Numbers
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-blue-100 max-w-2xl mx-auto"
          >
            The crisis is real, but together we can make a difference.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
