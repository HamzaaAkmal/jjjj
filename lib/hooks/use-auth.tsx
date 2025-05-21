"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { auth } from "../firebase"
import { signInUser, signOutUser, registerUser, getUserData } from "../services/auth-service"
import type { UserRole } from "../types"

interface AuthContextType {
  user: User | null
  userData: any | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isClient: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true)
      setUser(user)

      if (user) {
        try {
          const userData = await getUserData(user)
          setUserData(userData)
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await signInUser(email, password)
      const userData = await getUserData(userCredential.user)
      setUserData(userData)

      // Redirect based on user role
      if (userData?.role === "client") {
        router.push("/client/dashboard")
      } else {
        router.push("/admin/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to login")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: UserRole = "client") => {
    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await registerUser(email, password, name, role)
      const userData = await getUserData(userCredential.user)
      setUserData(userData)

      // Redirect based on user role
      if (role === "client") {
        router.push("/client/dashboard")
      } else {
        router.push("/admin/dashboard")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Failed to register")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)

    try {
      await signOutUser()
      router.push("/")
    } catch (error: any) {
      console.error("Logout error:", error)
      setError(error.message || "Failed to logout")
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = userData?.role === "admin" || userData?.role === "manager"
  const isClient = userData?.role === "client"

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isLoading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
