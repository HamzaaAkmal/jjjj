import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser } from "@/lib/db"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth-node"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "staff" } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      status: "active",
    })

    // Get the newly created user
    const newUser = await getUserByEmail(email)

    // Generate JWT token
    const token = generateToken(newUser)

    // Set auth cookie
    setAuthCookie(token)

    // Return user data (without password)
    delete newUser.password_hash

    return NextResponse.json({
      message: "Registration successful",
      user: newUser,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
