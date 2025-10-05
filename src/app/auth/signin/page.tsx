"use client"
import { Suspense } from "react"
import AuthButtons from "@/components/auth/auth-buttons"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

// Separate component that uses useSearchParams
function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    // Check if user is already authenticated and redirect if they are
    getSession().then(session => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [router, callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/20 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 ring-1 ring-white/30 dark:ring-white/10 border border-white/20">
          {/* Back Button */}
          <Link href="/" className="flex items-center text-white/90 hover:text-white transition-all duration-300 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to home
          </Link>
          
          {/* Header */}
          <div className="text-center">
            {/* Logo */}
            <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src="/logo.png"
                  alt="MannSahay Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Welcome to MannSahay
            </h1>
            <p className="text-white/80 text-lg font-light">
              Your mental health companion awaits
            </p>
          </div>
          
          {/* Auth Buttons */}
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <AuthButtons />
          </div>
          
          {/* Terms */}
          <p className="text-sm text-white/70 text-center pt-6 border-t border-white/20">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-semibold underline text-white hover:text-white/90 transition-colors duration-200">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold underline text-white hover:text-white/90 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -z-10 inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}

// Loading fallback component
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/20 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 ring-1 ring-white/30 dark:ring-white/10">
          <div className="animate-pulse">
            <div className="h-4 bg-white/30 rounded w-24 mb-4"></div>
            <div className="w-32 h-32 mx-auto bg-white/30 rounded-full mb-6"></div>
            <div className="h-9 bg-white/30 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-5 bg-white/30 rounded w-2/3 mx-auto mb-6"></div>
            <div className="space-y-3">
              <div className="h-12 bg-white/30 rounded-xl"></div>
              <div className="h-12 bg-white/30 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  )
}