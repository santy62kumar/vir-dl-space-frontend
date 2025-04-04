"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, FileText, Home, LineChartIcon, LogOut, Menu, MessageSquare, PlusCircle, Settings, User } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileOpen(false)
  }, [pathname])

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      name: "Deals",
      href: "/dashboard/deals",
      icon: FileText,
      active: pathname.startsWith("/dashboard/deals"),
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      active: pathname.startsWith("/dashboard/messages"),
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
      active: pathname.startsWith("/dashboard/documents"),
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: LineChartIcon,
      active: pathname.startsWith("/dashboard/analytics"),
    },
  ]

  // Add analytics link for admin users
  if (user.role === "admin") {
    navigation.push({
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/analytics"),
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="text-primary">Virtual Deal Room</span>
              </Link>
              <div className="my-4 border-t" />
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    item.active ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary"
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <div className="my-4 border-t" />
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  pathname === "/dashboard/profile"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  pathname === "/dashboard/settings"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={() => logout()}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-primary">Virtual Deal Room</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/dashboard/deals/new")}>
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Deal</span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">Virtual Deal Room</span>
            </Link>
          </div>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  item.active ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <div className="my-4 border-t" />
            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard/profile"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard/settings"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

