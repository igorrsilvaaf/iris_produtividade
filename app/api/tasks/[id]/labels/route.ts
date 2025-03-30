import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getTaskLabels, addLabelToTask, removeLabelFromTask } from "@/lib/labels"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const labels = await getTaskLabels(taskId)

    return NextResponse.json({ labels })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch task labels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const { labelId } = await request.json()

    if (!labelId) {
      return NextResponse.json({ message: "Label ID is required" }, { status: 400 })
    }

    await addLabelToTask(taskId, labelId)

    return NextResponse.json({ message: "Label added to task successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to add label to task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const { labelId } = await request.json()

    if (!labelId) {
      return NextResponse.json({ message: "Label ID is required" }, { status: 400 })
    }

    await removeLabelFromTask(taskId, labelId)

    return NextResponse.json({ message: "Label removed from task successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to remove label from task" }, { status: 500 })
  }
}

