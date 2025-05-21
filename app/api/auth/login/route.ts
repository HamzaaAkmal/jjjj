import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, query } from "@/lib/db"
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth-node"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json({ error: "Your account is inactive. Please contact an administrator." }, { status: 403 })
    }

    // Update last login time
    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])

    // Generate JWT token
    const token = generateToken(user)

    // Set auth cookie
    setAuthCookie(token)

    // Return user data (without password)
    delete user.password_hash

    return NextResponse.json({
      message: "Login successful",
      user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
