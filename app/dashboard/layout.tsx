import type React from "react"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { cookies } from "next/headers"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Check for token in cookies on the server
  const cookieStore: Promise<ReadonlyRequestCookies> = cookies()
  const token = (await cookieStore).get("token")

  // If no token, redirect to login
  // if (!token) {
  //   redirect("/auth/login")
  // }

  return <DashboardLayout>{children}</DashboardLayout>
}

