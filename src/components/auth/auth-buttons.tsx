"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaGithub } from "react-icons/fa"

export default function AuthButtons() {
  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="flex items-center justify-center gap-2"
      >
        <FaGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="flex items-center justify-center gap-2"
      >
        <FaGithub className="h-5 w-5" />
        Continue with GitHub
      </Button>
    </div>
  )
}