'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  BookOpen, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Bell,
  Bookmark,
  TrendingUp,
  Phone
} from 'lucide-react';
import NotificationsDropdown from './notifications-dropdown';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/dashboard/progress',
    label: 'Progress',
    icon: TrendingUp,
  },
  {
    href: '/dashboard/chat',
    label: 'AI Chat',
    icon: MessageCircle,
  },
  {
    href: '/dashboard/booking',
    label: 'Book Session',
    icon: Calendar,
  },
  {
    href: '/dashboard/forum',
    label: 'Forum',
    icon: Users,
  },
  {
    href: '/dashboard/resources',
    label: 'Resources',
    icon: BookOpen,
  },
  {
    href: '/dashboard/resources/bookmarks',
    label: 'Bookmarks',
    icon: Bookmark,
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
  },
];

export default function DashboardNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group" onClick={handleLogoClick}>
              <img 
                src="/logo.png" 
                alt="MannSahay Logo" 
                className="h-8 w-8 rounded-lg transition-transform group-hover:scale-110"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MannSahay
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <NotificationsDropdown />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 min-w-0">
                    {session?.user?.name && (
                      <p className="font-medium text-sm truncate">{session.user.name}</p>
                    )}
                    {session?.user?.email && (
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="flex items-center cursor-pointer">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>Contact</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center cursor-pointer text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9 p-0 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200/50">
          <div className="pt-2 pb-4 space-y-1 bg-white/80 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block pl-4 pr-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}