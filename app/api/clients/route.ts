import { type NextRequest, NextResponse } from "next/server"
import { getAllClients, createClient } from "@/lib/db"
import { requireAuth } from "@/lib/auth-node"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const clients = await getAllClients()

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Get clients error:", error)
    return NextResponse.json({ error: "An error occurred while fetching clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const clientData = await request.json()

    // Generate UUID for new client
    const clientId = uuidv4()

    // Create client in database
    await createClient({
      id: clientId,
      ...clientData,
    })

    return NextResponse.json(
      {
        message: "Client created successfully",
        clientId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json({ error: "An error occurred while creating client" }, { status: 500 })
  }
}
