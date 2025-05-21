import { type NextRequest, NextResponse } from "next/server"
import { getAllApartments, createApartment } from "@/lib/db"
import { requireAuth } from "@/lib/auth-node"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const apartments = await getAllApartments()

    return NextResponse.json({ apartments })
  } catch (error) {
    console.error("Get apartments error:", error)
    return NextResponse.json({ error: "An error occurred while fetching apartments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const apartmentData = await request.json()

    // Generate UUID for new apartment
    const apartmentId = uuidv4()

    // Create apartment in database
    await createApartment({
      id: apartmentId,
      ...apartmentData,
    })

    return NextResponse.json(
      {
        message: "Apartment created successfully",
        apartmentId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create apartment error:", error)
    return NextResponse.json({ error: "An error occurred while creating apartment" }, { status: 500 })
  }
}
