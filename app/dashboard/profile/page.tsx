"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, User } from "lucide-react"

type UserProfile = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  stats?: {
    totalDeals: number
    activeDeals: number
    completedDeals: number
    totalDocuments: number
  }
}

export default function ProfilePage() {
  const { user, token } = useAuth()
//   const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user profile
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Fetch user stats (this endpoint would need to be implemented on the backend)
          const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          let stats = null
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            stats = statsData.data
          }

          const profileData = {
            ...data.user,
            stats,
          }

          setProfile(profileData)
          setName(profileData.name)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast("Error", {
            description: "Failed to load profile information",
            //   variant: "destructive",
            //   title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUserProfile()
    }
  }, [token, toast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => (prev ? { ...prev, name: data.user.name } : null))

        toast("Profile updated", {
            description: "Your profile has been updated successfully",
            //   title: "Profile updated",
        })
      } else {
        const data = await response.json()
        toast("Update failed", {
            description: data.message || "Failed to update profile",
            //   variant: "destructive",
            //   title: "Update failed",
        })
      }
    } catch (error) {
      toast("Update failed", {
          description: "An error occurred while updating your profile",
          // variant: "destructive",
          // title: "Update failed",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordError("")
    setIsUpdating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        toast("Password updated", {
            description: "Your password has been updated successfully",
            //   title: "Password updated",
        })
      } else {
        const data = await response.json()
        toast("Update failed", {
            description: data.message || "Failed to update password",
            //   variant: "destructive",
            //   title: "Update failed",
        })
      }
    } catch (error) {
      toast("Update failed", {
          description: "An error occurred while updating your password",
          // variant: "destructive",
          // title: "Update failed",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">Admin</span>
      case "seller":
        return <span className="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">Seller</span>
      case "buyer":
        return <span className="rounded-full bg-green-500 px-2 py-1 text-xs text-white">Buyer</span>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : profile ? (
        <>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{profile.email}</p>
                {getRoleBadge(profile.role)}
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {profile.stats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.stats.totalDeals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.stats.activeDeals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.stats.completedDeals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.stats.totalDocuments}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account information and profile details.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update your email.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <User className="mb-2 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Profile not found</h2>
            <p className="text-muted-foreground">Unable to load your profile information.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

