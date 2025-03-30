import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getLabel, updateLabel, deleteLabel } from "@/lib/labels"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const labelId = Number.parseInt(resolvedParams.id)
    const label = await getLabel(labelId, session.user.id)

    if (!label) {
      return NextResponse.json({ message: "Label not found" }, { status: 404 })
    }

    return NextResponse.json({ label })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch label" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const labelId = Number.parseInt(resolvedParams.id)
    const updates = await request.json()

    const label = await updateLabel(labelId, session.user.id, updates)

    return NextResponse.json({ label })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update label" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const labelId = Number.parseInt(resolvedParams.id)

    await deleteLabel(labelId, session.user.id)

    return NextResponse.json({ message: "Label deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete label" }, { status: 500 })
  }
}

