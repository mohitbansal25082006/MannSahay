"use client"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/shared/navbar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navbar />
      {children}
      <Toaster />
    </SessionProvider>
  )
}