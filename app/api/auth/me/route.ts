import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-node"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "An error occurred while getting user data" }, { status: 500 })
  }
}
