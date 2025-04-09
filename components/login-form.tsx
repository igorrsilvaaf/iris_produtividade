"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageProvider } from "@/components/language-provider";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { t, language } = useTranslation()

  const formSchema = z.object({
    email: z.string()
      .min(1, { message: t("Email is required") })
      .email({ message: t("Please enter a valid email address") }),
    password: z.string()
      .min(1, { message: t("Password is required") })
      .min(6, { message: t("Password must be at least 6 characters") }),
    rememberMe: z.boolean().default(false),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Capturar o idioma atual para enviá-lo ao servidor
      const currentLanguage = (language && ["pt", "en"].includes(language)) ? language : "pt"
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          preferredLanguage: currentLanguage
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginAttempts(prev => prev + 1)
        
        // Translate error messages from the server
        let errorMessage = "";
        if (data.message.includes("Invalid email or password")) {
          errorMessage = loginAttempts >= 2 
            ? t("Multiple failed login attempts. Make sure your credentials are correct or reset your password.")
            : t("Invalid email or password. Please check your credentials and try again.");
        } else {
          errorMessage = t(data.message) || t("Failed to login");
        }
        
        throw new Error(errorMessage);
      }

      // Reset login attempts on successful login
      setLoginAttempts(0)
      
      toast({
        variant: "success",
        title: t("Sucesso login"),
        description: t("Redirecionando login"),
        duration: 3000,
      })

      router.push("/app")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Erro login"),
        description: error.message,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Password")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                    autoComplete="current-password"
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
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("Remember me")}
                </label>
              </div>
            )}
          />
          <Button variant="link" className="px-0 font-normal" asChild>
            <a href="/forgot-password">{t("Forgot password?")}</a>
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Sign In")}
            </>
          ) : (
            t("Sign In")
          )}
        </Button>
      </form>
    </Form>
  )
}

