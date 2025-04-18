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
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEmailAvailable, setIsEmailAvailable] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const formSchema = z
    .object({
      name: z
        .string()
        .min(1, { message: t("Name is required") })
        .min(2, { message: t("Name must be at least 2 characters") }),
      email: z
        .string()
        .min(1, { message: t("Email is required") })
        .email({ message: t("Please enter a valid email address") }),
      password: z
        .string()
        .min(1, { message: t("Password is required") })
        .min(6, { message: t("Password must be at least 6 characters") })
        .regex(/.*[A-Z].*/, { message: t("Password must contain at least one uppercase letter") })
        .regex(/.*[0-9].*/, { message: t("Password must contain at least one number") }),
      confirmPassword: z.string().min(1, { message: t("Please confirm your password") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords do not match"),
      path: ["confirmPassword"],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const checkEmailAvailability = async (email: string) => {
    if (!email || !form.formState.dirtyFields.email) return
    
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: "GET",
      })
      
      const data = await response.json()
      setIsEmailAvailable(data.available)
      
      if (!data.available) {
        form.setError("email", {
          type: "manual",
          message: t("This email is already registered. Please use a different email or try logging in.")
        })
      }
    } catch (error) {
      // Silent fail - don't block registration on email check failure
      console.error("Failed to check email availability:", error)
    }
  }

  // Add email blur handler to check availability
  const onEmailBlur = (email: string) => {
    if (email && email.includes('@') && email.includes('.')) {
      checkEmailAvailability(email);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Final email check before submission
      if (!isEmailAvailable) {
        throw new Error(t("This email is already registered. Please use a different email or try logging in."))
      }
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "";
        
        if (data.message.includes("Email already exists")) {
          setIsEmailAvailable(false)
          errorMessage = t("This email is already registered. Please use a different email or try logging in.");
          form.setError("email", {
            type: "manual",
            message: errorMessage
          });
        } else {
          errorMessage = t(data.message) || t("Failed to register");
        }
        
        throw new Error(errorMessage);
      }

      toast({
        variant: "success",
        title: t("Sucesso registro"),
        description: t("Mensagem conta criada"),
        duration: 3000,
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Erro registro"),
        description: error.message,
        duration: 5000,
      })
      console.error("Registration error:", error.message);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} autoComplete="name" aria-required="true" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Email")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
                  {...field} 
                  autoComplete="email" 
                  aria-required="true" 
                  onBlur={() => onEmailBlur(field.value)}
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
              <p className="text-xs text-muted-foreground">
                {t("Password must be at least 6 characters with one uppercase letter and one number.")}
              </p>
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Sign Up")}
            </>
          ) : (
            t("Sign Up")
          )}
        </Button>
      </form>
    </Form>
  )
}

