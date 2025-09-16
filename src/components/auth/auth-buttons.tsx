"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { useSearchParams } from "next/navigation"

export default function AuthButtons() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={() => signIn("google", { callbackUrl })}
        className="flex items-center justify-center gap-2"
      >
        <FaGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        onClick={() => signIn("github", { callbackUrl })}
        className="flex items-center justify-center gap-2"
      >
        <FaGithub className="h-5 w-5" />
        Continue with GitHub
      </Button>
    </div>
  )
}