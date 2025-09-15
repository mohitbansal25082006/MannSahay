import AuthButtons from "@/components/auth/auth-buttons"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Back Button */}
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to MannSahay
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your mental health companion
            </p>
          </div>
          
          {/* Auth Buttons */}
          <AuthButtons />
          
          {/* Terms */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}