"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Bell, Moon, Sun, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
//   const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dealUpdates, setDealUpdates] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [documentNotifications, setDocumentNotifications] = useState(true)

  // Appearance settings
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveNotificationSettings = async () => {
    setIsUpdating(true)

    try {
      // This would be an API call to save notification settings
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/notifications`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     emailNotifications,
      //     dealUpdates,
      //     messageNotifications,
      //     documentNotifications,
      //   }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast("Settings saved", {
          description: "Your notification settings have been updated",
          // title: "Settings saved",
      })
    } catch (error) {
      toast("Error", {
          description: "Failed to save notification settings",
          // variant: "destructive",
          // title: "Error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)

    // Toggle dark mode class on document
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    toast(newMode ? "Dark mode enabled" : "Light mode enabled", {
        description: `The application theme has been updated to ${newMode ? "dark" : "light"} mode`,
        //   title: newMode ? "Dark mode enabled" : "Light mode enabled",
    })
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure how and when you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deal-updates">Deal Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about changes to your deals</p>
              </div>
              <Switch id="deal-updates" checked={dealUpdates} onCheckedChange={setDealUpdates} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-notifications">New Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
              </div>
              <Switch
                id="message-notifications"
                checked={messageNotifications}
                onCheckedChange={setMessageNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="document-notifications">Document Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified when documents are added or updated</p>
              </div>
              <Switch
                id="document-notifications"
                checked={documentNotifications}
                onCheckedChange={setDocumentNotifications}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveNotificationSettings} disabled={isUpdating}>
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the appearance of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

