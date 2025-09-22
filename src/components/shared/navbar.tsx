// E:\mannsahay\src\components\shared\navbar.tsx
"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="MannSahay Logo" 
                className="h-10 w-10 rounded-full"
              />
            </div>
            <span className="text-2xl font-bold text-white">MannSahay</span>
          </Link>
          
          {/* Profile Section (only when logged in) */}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {session.user?.name?.charAt(0) || <Heart className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border-white/10" align="end">
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-400 hover:text-red-300 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}