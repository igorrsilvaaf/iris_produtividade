import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getLabels, createLabel } from "@/lib/labels"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const labels = await getLabels(session.user.id)

    return NextResponse.json({ labels })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch labels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Label name is required" }, { status: 400 })
    }

    const label = await createLabel(session.user.id, name, color)

    return NextResponse.json({ label }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create label" }, { status: 500 })
  }
}

