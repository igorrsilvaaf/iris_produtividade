import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { StorageService } from "@/lib/storage"

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await StorageService.exportUserData(session.user.id)

    // Adicionar timestamp ao nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `todoist-clone-backup-${timestamp}.json`

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to export data" }, { status: 500 })
  }
}

