"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"

export function LoginForm({ userType = "admin" }: { userType?: "admin" | "client" }) {
  const router = useRouter()
  const { toast } = useToast()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[LoginForm handleSubmit] Function called")

    try {
      console.log("[LoginForm handleSubmit] Before login call", { isLoading })
      await login(formData.email, formData.password)

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
    } catch (error) {
      console.error("[LoginForm handleSubmit] Login error:", error)
      console.log("[LoginForm handleSubmit] Error caught", { isLoading, error })
      // Error is handled by the useAuth hook
    }
    console.log("[LoginForm handleSubmit] Function completed", { isLoading })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center text-sm text-green-700 hover:underline md:left-8 md:top-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image
              src="/placeholder.svg?height=50&width=50"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-md bg-green-700 p-2"
            />
            <h1 className="text-3xl font-bold text-gray-900">{userType === "admin" ? "Admin" : "Client"} Login</h1>
            <p className="text-gray-500">
              {userType === "admin"
                ? "Enter your credentials to access the admin dashboard"
                : "Access your apartment details and payment information"}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder={userType === "admin" ? "admin@example.com" : "client@example.com"}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href={`/${userType}/forgot-password`} className="text-sm text-green-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          {userType === "client" && (
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/client/register" className="text-green-700 hover:underline">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
