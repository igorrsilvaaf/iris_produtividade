"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ArrowLeft, Check, Eye, EyeOff, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Validar o token na montagem do componente
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()
        
        setIsTokenValid(data.valid)
      } catch (error) {
        console.error("Error verifying token:", error)
        setIsTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    if (token) {
      verifyToken()
    } else {
      setIsVerifying(false)
      setIsTokenValid(false)
    }
  }, [token])

  const formSchema = z.object({
    password: z.string()
      .min(6, { message: t("Password must be at least 6 characters") }),
    confirmPassword: z.string()
      .min(1, { message: t("Please confirm your password") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("Passwords do not match"),
    path: ["confirmPassword"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsResetting(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(t(data.message) || t("Failed to reset password"));
      }

      setIsSuccess(true)
      
      toast({
        variant: "success",
        title: t("Password reset successful"),
        description: t("Your password has been successfully reset."),
        duration: 5000,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error.message,
        duration: 5000,
      })
    } finally {
      setIsResetting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("Invalid or expired token")}</AlertTitle>
          <AlertDescription>
            {t("The password reset link is invalid or has expired. Please request a new one.")}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="w-full">
          <Link href="/forgot-password">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back to Forgot Password")}
          </Link>
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>{t("Password reset successful")}</AlertTitle>
          <AlertDescription>
            {t("Your password has been successfully reset. You can now log in with your new password.")}
          </AlertDescription>
        </Alert>
        <Button className="w-full" asChild>
          <Link href="/login">
            {t("Go to Login")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Reset your password")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("Enter your new password below.")}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("New Password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="new-password"
                      aria-required="true"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t("Hide password") : t("Show password")}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? t("Hide password") : t("Show password")}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Confirm Password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="new-password"
                      aria-required="true"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t("Hide password") : t("Show password")}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showConfirmPassword ? t("Hide password") : t("Show password")}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back to Login")}
              </Link>
            </Button>
            <Button type="submit" disabled={isResetting}>
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Resetting...")}
                </>
              ) : (
                t("Reset Password")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 