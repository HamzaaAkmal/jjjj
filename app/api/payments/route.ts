import { type NextRequest, NextResponse } from "next/server"
import { getAllPayments, createPayment } from "@/lib/db"
import { requireAuth } from "@/lib/auth-node"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payments = await getAllPayments()

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ error: "An error occurred while fetching payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const paymentData = await request.json()

    // Generate UUID for new payment
    const paymentId = uuidv4()

    // Create payment in database
    await createPayment({
      id: paymentId,
      ...paymentData,
    })

    return NextResponse.json(
      {
        message: "Payment created successfully",
        paymentId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json({ error: "An error occurred while creating payment" }, { status: 500 })
  }
}
