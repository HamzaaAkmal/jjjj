import { type NextRequest, NextResponse } from "next/server"
import { getAllTransactions, createTransaction, getAccountBalances } from "@/lib/db"
import { requireAuth } from "@/lib/auth-node"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const transactions = await getAllTransactions()
    const balances = await getAccountBalances()

    return NextResponse.json({
      transactions,
      balances,
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "An error occurred while fetching transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const transactionData = await request.json()

    // Generate UUID for new transaction
    const transactionId = uuidv4()

    // Create transaction in database
    await createTransaction({
      id: transactionId,
      ...transactionData,
    })

    // Get updated balances
    const balances = await getAccountBalances()

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        transactionId,
        balances,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "An error occurred while creating transaction" }, { status: 500 })
  }
}
