import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "./prisma"


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
    const session = await prisma.sessions.findFirst({
      where: {
        session_token: sessionToken,
        expires: {
          gt: new Date()
        }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        }
      }
    })

    if (!session || !session.users) {
      return null
    }

    return { 
      user: {
        id: session.users.id, 
        name: session.users.name, 
        email: session.users.email,
        avatar_url: session.users.avatar_url
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
  } else {
    expires.setHours(expires.getHours() + 24)
  }

  await prisma.sessions.create({
    data: {
      user_id: userId,
      session_token: sessionToken,
      expires: expires
    }
  })

  const cookieStore = await cookies()
  
  // Configurações mais permissivas para compatibilidade mobile
  const cookieOptions = {
    httpOnly: true,
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Adicionar atributos para melhor suporte mobile
    ...(process.env.NODE_ENV === "production" && {
      domain: process.env.COOKIE_DOMAIN || undefined
    })
  }
  
  cookieStore.set("session_token", sessionToken, cookieOptions)

  return sessionToken
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const result = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        trial_start_date: new Date(),
        trial_expired: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true
      }
    })

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      avatar_url: result.avatar_url
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("Email already exists")
    }
    throw error
  }
}

export async function login(email: string, password: string): Promise<User> {
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      avatar_url: true
    }
  })

  if (!user) {
    throw new Error("Invalid email or password")
  }

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
    await prisma.sessions.deleteMany({
      where: {
        session_token: sessionToken
      }
    })
  }

  cookieStore.delete("session_token")
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!user) {
    return null
  }

  const userId = user.id
  const resetToken = crypto.randomUUID()
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)

  await prisma.password_reset_tokens.deleteMany({
    where: { user_id: userId }
  })

  await prisma.password_reset_tokens.create({
    data: {
      user_id: userId,
      token: resetToken,
      expires: expires
    }
  })

  return resetToken
}

export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  try {
    const resetToken = await prisma.password_reset_tokens.findFirst({
      where: {
        token: token,
        expires: {
          gt: new Date()
        }
      },
      select: {
        user_id: true
      }
    })

    if (!resetToken) {
      return null
    }

    return resetToken.user_id
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
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    await prisma.password_reset_tokens.deleteMany({
      where: { token: token }
    })

    await prisma.sessions.deleteMany({
      where: { user_id: userId }
    })

    return true
  } catch (error) {
    console.error("Error resetting password:", error)
    return false
  }
}

