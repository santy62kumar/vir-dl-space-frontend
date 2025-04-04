"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
// import { cookies } from 'next/headers';

type User = {
  id: string
  name: string
  email: string
  role: "buyer" | "seller" | "admin"
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  // const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid or expired
        localStorage.removeItem("token")
        setToken(null)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token);
        
        toast("Login successful", {
          description: `Welcome back, ${data.user.name}!`,
          // title: "Login successful",
        })
        
        router.push("/dashboard");
      } else {
        toast("Login failed", {
          description: data.message || "Invalid credentials",
          // variant: "destructive",
          // title: "Login failed",
        })
      }
    } catch (error) {
      toast("Login failed", {
        description: "An error occurred during login",
        // variant: "destructive",
        // title: "Login failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token);

        toast("Registration successful", {
          description: `Welcome, ${data.user.name}!`,
          // title: "Registration successful",
        })

        router.push("/dashboard")
      } else {
        toast("Registration failed", {
          description: data.message || "Could not create account",
          // variant: "destructive",
          // title: "Registration failed",
        })
      }
    } catch (error) {
      toast("Registration failed", {
        description: "An error occurred during registration",
        // variant: "destructive",
        // title: "Registration failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      localStorage.removeItem("token")
      setUser(null)
      setToken(null)
      setIsLoading(false)
      router.push("/")

      toast("Logged out", {
        description: "You have been successfully logged out",
        // title: "Logged out",
      })
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

