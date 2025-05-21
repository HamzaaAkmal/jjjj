import { type NextRequest, NextResponse } from "next/server"
import { getClientById, updateClient, deleteClient } from "@/lib/db"
import { requireAuth } from "@/lib/auth-node"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = await getClientById(params.id)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json({ error: "An error occurred while fetching client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const clientData = await request.json()

    // Check if client exists
    const existingClient = await getClientById(params.id)

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Update client in database
    await updateClient(params.id, clientData)

    return NextResponse.json({
      message: "Client updated successfully",
    })
  } catch (error) {
    console.error("Update client error:", error)
    return NextResponse.json({ error: "An error occurred while updating client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if client exists
    const existingClient = await getClientById(params.id)

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Delete client from database
    await deleteClient(params.id)

    return NextResponse.json({
      message: "Client deleted successfully",
    })
  } catch (error) {
    console.error("Delete client error:", error)
    return NextResponse.json({ error: "An error occurred while deleting client" }, { status: 500 })
  }
}
