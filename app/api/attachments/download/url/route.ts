import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const urlParam = request.nextUrl.searchParams.get("url");
    const nameParam = request.nextUrl.searchParams.get("name") || "download";

    if (!urlParam) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(urlParam);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    if (
      !(
        parsed.protocol === "http:" ||
        parsed.protocol === "https:" ||
        parsed.protocol === "data:"
      )
    ) {
      return NextResponse.json(
        { error: "Unsupported protocol" },
        { status: 400 }
      );
    }

    if (parsed.protocol === "data:") {
      const match = urlParam.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid data URL" },
          { status: 400 }
        );
      }
      const mime = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      const headers = new Headers();
      headers.set("Content-Type", mime || "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${nameParam}"`);
      headers.set("Content-Length", buffer.length.toString());
      return new NextResponse(buffer, { status: 200, headers });
    }

    const res = await fetch(urlParam);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch resource" },
        { status: 502 }
      );
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType =
      res.headers.get("content-type") || "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${nameParam}"`);
    headers.set("Content-Length", buffer.length.toString());
    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
