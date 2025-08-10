import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE todos ADD COLUMN IF NOT EXISTS external_links JSONB;`
    );
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS user_integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        github_pat VARCHAR(255),
        jira_token VARCHAR(255),
        jira_domain VARCHAR(255),
        asana_pat VARCHAR(255),
        created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "migration error" },
      { status: 500 }
    );
  }
}
