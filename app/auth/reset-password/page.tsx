"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
//   const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    setPasswordError("")
    setIsSubmitting(true)

    try {
      // This would be an API call to reset password
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ token, password }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast("Password reset successful", {
          description: "Your password has been reset. You can now log in with your new password.",
          // title: "Password reset successful",
      })

      router.push("/auth/login")
    } catch (error) {
      toast("Error", {
          description: "Failed to reset password. The link may be invalid or expired.",
          // variant: "destructive",
          // title: "Error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Please request a new password reset link.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">Request New Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

