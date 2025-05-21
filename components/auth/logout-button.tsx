"use client"

import { LogOut } from "lucide-react"
import { useAuthContext } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"

export function LogoutButton({ className }: { className?: string }) {
  const { logout, loading } = useAuthContext()

  return (
    <Button variant="ghost" className={className} onClick={() => logout()} disabled={loading}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
