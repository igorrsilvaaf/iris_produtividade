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

    // Formato do nome do arquivo: to-do-backup-ANO-MES-DIA-HORA-MINUTO-SEGUNDO.json
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '-').split('Z')[0];
    const filename = `iris-backup-${timestamp}.json`;

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

