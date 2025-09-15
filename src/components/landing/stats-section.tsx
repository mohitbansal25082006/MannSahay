import { Card, CardContent } from "@/components/ui/card"
import { Users, Heart, MessageSquare, Shield } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "40M+",
    label: "Indian Students",
    description: "Potential beneficiaries across India"
  },
  {
    icon: Heart,
    value: "60%",
    label: "Students Affected",
    description: "Report mental health challenges"
  },
  {
    icon: MessageSquare,
    value: "15%",
    label: "Seek Help",
    description: "Currently access professional support"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Confidential",
    description: "Your privacy is our priority"
  }
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mental Health in India: By the Numbers
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            The crisis is real, but together we can make a difference.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-0 text-white">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold mb-1">{stat.label}</div>
                  <div className="text-blue-100 text-sm">{stat.description}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}