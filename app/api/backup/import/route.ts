import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { StorageService } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data || typeof data !== "object") {
      return NextResponse.json({ message: "Invalid backup data" }, { status: 400 })
    }

    const result = await StorageService.importUserData(session.user.id, data)

    if (!result) {
      throw new Error("Failed to import data")
    }

    return NextResponse.json({ message: "Data imported successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to import data" }, { status: 500 })
  }
}

