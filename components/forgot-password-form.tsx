"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const formSchema = z.object({
    email: z.string()
      .min(1, { message: t("Email is required") })
      .email({ message: t("Please enter a valid email address") }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Primeiro, verificar a estrutura do banco de dados
      console.log("Verificando estrutura do banco de dados...");
      await fetch("/api/auth/verify-db").then(res => res.json());
      console.log("Estrutura do banco de dados verificada");
      
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(t(data.message) || t("Failed to process request"));
      }

      setIsSubmitted(true)
      
      // Toast de sucesso
      toast({
        variant: "success",
        title: t("Request submitted"),
        description: process.env.NODE_ENV !== 'production' 
          ? t("Check the console for the email preview link")
          : t("Check your email for password reset instructions."),
        duration: 8000,
      })
    } catch (error: any) {
      console.error("Erro no processo de recuperação de senha:", error);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error.message,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTitle>{t("Check your email")}</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV !== 'production' 
              ? t("In development mode, please check the server console for the email preview link. A test email has been generated and you can view it by clicking on the preview URL in the console.")
              : t("We've sent you an email with instructions to reset your password. If you don't see it, check your spam folder.")}
          </AlertDescription>
        </Alert>
        {process.env.NODE_ENV !== 'production' && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
            <AlertTitle>{t("Development Mode")}</AlertTitle>
            <AlertDescription>
              {t("In development, we use Ethereal Email for testing. Look for a line in the server console that says 'LINK PARA VISUALIZAR O EMAIL:' and click that URL to see the email.")}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to Login")}
            </Link>
          </Button>
          <Button onClick={() => setIsSubmitted(false)}>
            {t("Try another email")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Forgot your password?")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("Enter your email address and we'll send you a link to reset your password.")}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t("Your email")} 
                    {...field} 
                    autoComplete="email"
                    aria-required="true"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back to Login")}
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Sending...")}
                </>
              ) : (
                t("Send Reset Link")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 