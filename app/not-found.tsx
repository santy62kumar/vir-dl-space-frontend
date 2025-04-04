import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Page Not Found</h2>
        <p className="mx-auto max-w-[500px] text-muted-foreground md:text-lg">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

