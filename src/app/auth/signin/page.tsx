"use client"
import { Suspense } from "react"
import AuthButtons from "@/components/auth/auth-buttons"
import Link from "next/link"
import { ArrowLeft, Brain } from "lucide-react"
import { getSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 space-y-8 ring-1 ring-indigo-100 dark:ring-indigo-900/20">
          {/* Back Button */}
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          
          {/* Header */}
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Welcome to MannSahay
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sign in to access your mental health companion
            </p>
          </div>
          
          {/* Auth Buttons */}
          <AuthButtons />
          
          {/* Terms */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-medium underline text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium underline text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 space-y-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
            <div className="h-12 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-6"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
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