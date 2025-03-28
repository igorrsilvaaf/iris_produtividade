import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: number
  name: string
  email: string
}

export type Session = {
  user: User
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  try {
    const user = await sql`
    SELECT u.id, u.name, u.email
    FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.session_token = ${sessionToken}
    AND s.expires > NOW()
  `

    if (!user || user.length === 0) {
      return null
    }

    return { user: user[0] }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const expires = new Date()
  expires.setDate(expires.getDate() + 30) // 30 days from now

  await sql`
  INSERT INTO sessions (user_id, session_token, expires)
  VALUES (${userId}, ${sessionToken}, ${expires.toISOString()})
`

  const cookieStore = await cookies()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return sessionToken
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const result = await sql`
    INSERT INTO users (name, email, password)
    VALUES (${name}, ${email}, ${hashedPassword})
    RETURNING id, name, email
  `

    if (!result || result.length === 0) {
      throw new Error("Failed to create user")
    }

    return result[0]
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      throw new Error("Email already exists")
    }
    throw error
  }
}

export async function login(email: string, password: string): Promise<User> {
  const users = await sql`
  SELECT id, name, email, password
  FROM users
  WHERE email = ${email}
`

  if (!users || users.length === 0) {
    throw new Error("Invalid email or password")
  }

  const user = users[0]
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw new Error("Invalid email or password")
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (sessionToken) {
    await sql`
    DELETE FROM sessions
    WHERE session_token = ${sessionToken}
  `
  }

  cookieStore.delete("session_token")
}

