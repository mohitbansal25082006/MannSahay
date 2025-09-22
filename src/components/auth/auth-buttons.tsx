"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function AuthButtons() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider)
    try {
      const result = await signIn(provider, { 
        callbackUrl,
        redirect: true // Ensure redirect happens
      })
      
      if (result?.error) {
        toast.error(`Failed to sign in with ${provider}: ${result.error}`)
      }
    } catch (error) {
      console.error(`Sign in error with ${provider}:`, error)
      toast.error(`Failed to sign in with ${provider}`)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={() => handleSignIn("google")}
        disabled={isLoading === "google"}
        className="flex items-center justify-center gap-2"
      >
        <FaGoogle className="h-5 w-5" />
        {isLoading === "google" ? "Signing in..." : "Continue with Google"}
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSignIn("github")}
        disabled={isLoading === "github"}
        className="flex items-center justify-center gap-2"
      >
        <FaGithub className="h-5 w-5" />
        {isLoading === "github" ? "Signing in..." : "Continue with GitHub"}
      </Button>

      {/* GitHub specific info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>For GitHub: Make sure your email is public or you&apos;ve added it to your GitHub account.</p>
      </div>
    </div>
  )
}