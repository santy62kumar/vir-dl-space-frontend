"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
//   const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // This would be an API call to request password reset
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitted(true)
    } catch (error) {
      toast("Error", {
          description: "Failed to send password reset email. Please try again.",
          // variant: "destructive",
          // title: "Error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Link href="/auth/login" className="mr-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          </div>
          <CardDescription>
            {isSubmitted ? "Check your email for a reset link" : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        {isSubmitted ? (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-primary">
                If an account exists with the email <strong>{email}</strong>, you will receive a password reset link
                shortly.
              </p>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive an email?{" "}
              <button onClick={() => setIsSubmitted(false)} className="text-primary underline-offset-4 hover:underline">
                Try again
              </button>{" "}
              or{" "}
              <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                return to login
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
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
        )}
      </Card>
    </div>
  )
}

