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

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat Companion",
    description: "24/7 empathetic AI support that understands Indian context and culture.",
    color: "text-blue-600"
  },
  {
    icon: Calendar,
    title: "Counselor Booking",
    description: "Schedule confidential sessions with qualified mental health professionals.",
    color: "text-green-600"
  },
  {
    icon: Users,
    title: "Peer Support Forum",
    description: "Connect anonymously with fellow students facing similar challenges.",
    color: "text-purple-600"
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    description: "Access articles, videos, and exercises in Hindi, English, and regional languages.",
    color: "text-orange-600"
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Your data is encrypted and anonymized. No personal information stored.",
    color: "text-red-600"
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in 10+ Indian languages with cultural context awareness.",
    color: "text-cyan-600"
  },
  {
    icon: Brain,
    title: "Crisis Detection",
    description: "AI monitors conversations and alerts counselors during mental health emergencies.",
    color: "text-indigo-600"
  },
  {
    icon: Heart,
    title: "Wellness Tracking",
    description: "Monitor your mood, stress levels, and mental health progress over time.",
    color: "text-pink-600"
  },
  {
    icon: Phone,
    title: "24/7 Emergency Support",
    description: "Immediate access to crisis helplines and emergency mental health resources.",
    color: "text-yellow-600"
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Mental Health Support
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Designed specifically for Indian students with cultural sensitivity and privacy at its core.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}