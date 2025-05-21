import { type NextRequest, NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth-node"

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    clearAuthCookie()

    return NextResponse.json({
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}
