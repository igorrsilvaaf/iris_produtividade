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
      .min(6, { message: t("A senha deve ter pelo menos 6 caracteres") }),
    confirmPassword: z.string()
      .min(1, { message: t("Por favor, confirme sua senha") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("As senhas não coincidem"),
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
        title: t("Senha redefinida com sucesso"),
        description: t("Sua senha foi redefinida com sucesso."),
        duration: 5000,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Erro"),
        description: error.message,
        duration: 5000,
      })
    } finally {
      setIsResetting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center py-8" data-testid="reset-password-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-6" data-testid="reset-password-invalid-token">
        <Alert variant="destructive" data-testid="reset-password-invalid-token-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("Link inválido ou expirado")}</AlertTitle>
          <AlertDescription>
            {t("O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo.")}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="w-full" data-testid="reset-password-back-to-forgot">
          <Link href="/forgot-password">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Voltar para Esqueci a Senha")}
          </Link>
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6" data-testid="reset-password-success">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700" data-testid="reset-password-success-alert">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>{t("Senha redefinida com sucesso")}</AlertTitle>
          <AlertDescription>
            {t("Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.")}
          </AlertDescription>
        </Alert>
        <Button className="w-full" asChild data-testid="reset-password-go-to-login">
          <Link href="/login">
            {t("Ir para Login")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="reset-password-form">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Nova Senha")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      data-testid="reset-password-password-input"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="new-password"
                      aria-required="true"
                    />
                    <Button
                      data-testid="reset-password-password-toggle"
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t("Ocultar senha") : t("Mostrar senha")}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? t("Ocultar senha") : t("Mostrar senha")}</span>
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
                <FormLabel>{t("Confirmar Senha")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      data-testid="reset-password-confirm-password-input"
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      autoComplete="new-password"
                      aria-required="true"
                    />
                    <Button
                      data-testid="reset-password-confirm-password-toggle"
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t("Ocultar senha") : t("Mostrar senha")}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showConfirmPassword ? t("Ocultar senha") : t("Mostrar senha")}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button variant="outline" asChild data-testid="reset-password-back-to-login">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Voltar para Login")}
              </Link>
            </Button>
            <Button type="submit" disabled={isResetting} data-testid="reset-password-submit-button">
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Redefinindo...")}
                </>
              ) : (
                t("Redefinir Senha")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 