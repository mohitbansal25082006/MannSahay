import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import Providers from "@/components/providers"
import Navbar from "@/components/shared/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MannSahay - AI-Powered Mental Health Companion for Indian Students",
  description: "Your mental health companion designed for Indian students. Get support, book counseling, and connect with peers - all in a safe, confidential environment.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}