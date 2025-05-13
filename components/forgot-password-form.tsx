"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ArrowLeft, Mail, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [apiResponseMessage, setApiResponseMessage] = useState("")
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

      if (data.emailFound === false) {
        toast({
          variant: "destructive",
          title: t("Atenção!"),
          description: t(data.message),
          duration: 5000,
        });
        form.reset();
      } else {
        setSubmittedEmail(values.email)
        setApiResponseMessage(data.message)
        setIsSubmitted(true)
      }
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
        <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
          <Mail className="h-5 w-5 mr-2" />
          <AlertTitle>{t("Informação")}</AlertTitle>
          <AlertDescription>
            {t(apiResponseMessage)}
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertTitle>{t("Important")}</AlertTitle>
          <AlertDescription>
            {t("O link de redefinição de senha expirará após 1 hora. Se você não receber o email, verifique se digitou o endereço de email correto e verifique sua pasta de spam antes de tentar novamente.")}
          </AlertDescription>
        </Alert>
        
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Sending...")}
            </>
          ) : (
            t("Send Reset Link")
          )}
        </Button>
        <div className="text-center mt-4">
          <Button variant="link" className="px-0 font-normal" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to Login")}
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  )
} 