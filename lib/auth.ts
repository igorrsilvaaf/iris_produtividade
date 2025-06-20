import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as bcrypt from "bcryptjs"
import crypto from "crypto"
const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: number
  name: string
  email: string
  avatar_url?: string | null
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
    // Log para debug
    console.log("Tentando recuperar sessão com token:", sessionToken)
    
    const user = await sql`
    SELECT u.id, u.name, u.email, u.avatar_url
    FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.session_token = ${sessionToken}
    AND s.expires > NOW()
  `

    if (!user || user.length === 0) {
      console.log("Nenhum usuário encontrado com o token de sessão")
      return null
    }

    console.log("Sessão recuperada com sucesso para:", user[0].email)
    
    return { 
      user: {
        id: user[0].id, 
        name: user[0].name, 
        email: user[0].email,
        avatar_url: user[0].avatar_url
      } 
    }
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

export async function createSession(userId: number, rememberMe: boolean = false): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const expires = new Date()
  
  if (rememberMe) {
    expires.setDate(expires.getDate() + 30)
    console.log(`Criando sessão para usuário ${userId} com "Lembrar de mim" ativado. Expiração: ${expires.toISOString()}`)
  } else {
    expires.setHours(expires.getHours() + 24)
    console.log(`Criando sessão para usuário ${userId} sem "Lembrar de mim". Expiração: ${expires.toISOString()}`)
  }

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
    RETURNING id, name, email, avatar_url
  `

    if (!result || result.length === 0) {
      throw new Error("Failed to create user")
    }

    return {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      avatar_url: result[0].avatar_url
    }
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      throw new Error("Email already exists")
    }
    throw error
  }
}

export async function login(email: string, password: string): Promise<User> {
  const users = await sql`
  SELECT id, name, email, password, avatar_url
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

  const { password: _, ...userWithoutPassword } = user as User & { password: string }
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

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const users = await sql`
    SELECT id FROM users WHERE email = ${email}
  `

  if (!users || users.length === 0) {
    return null
  }

  const userId = users[0].id
  const resetToken = crypto.randomUUID()
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)

  await sql`
    DELETE FROM password_reset_tokens WHERE user_id = ${userId}
  `

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires)
    VALUES (${userId}, ${resetToken}, ${expires.toISOString()})
  `

  return resetToken
}

export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  try {
    const tokens = await sql`
      SELECT user_id FROM password_reset_tokens
      WHERE token = ${token}
      AND expires > NOW()
    `

    if (!tokens || tokens.length === 0) {
      return null
    }

    return tokens[0].user_id
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return null
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token)

  if (!userId) {
    return false
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  try {
    await sql`
      UPDATE users SET password = ${hashedPassword}
      WHERE id = ${userId}
    `

    await sql`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `

    await sql`
      DELETE FROM sessions WHERE user_id = ${userId}
    `

    return true
  } catch (error) {
    console.error("Error resetting password:", error)
    return false
  }
}

