"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { User } from "@/lib/auth"
import { useTranslation } from "@/lib/i18n"
import { Camera, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserWithAvatar = User & {
  avatar_url?: string | null
}

export function ProfileForm({ user }: { user: UserWithAvatar }) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(user.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const formSchema = z.object({
    name: z.string().min(2, { message: t("Name must be at least 2 characters") }),
    email: z.string().email({ message: t("Please enter a valid email address") }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          avatar_url: avatarBase64
        }),
      })

      if (!response.ok) {
        throw new Error(t("Failed to update profile"))
      }

      toast({
        title: t("Profile updated"),
        description: t("Your profile has been updated successfully."),
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update profile"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 256;
        canvas.height = 256;
        
        if (ctx) {
          ctx.drawImage(
            img,
            x, y, size, size,  
            0, 0, 256, 256     
          );
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            'image/jpeg',  
            0.85           
          );
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: t("Invalid file type"),
        description: t("Please upload an image file."),
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: t("File too large"),
        description: t("Please upload an image smaller than 5MB."),
      });
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      const processedImageBlob = await processImage(file);
      
      const base64String = await convertToBase64(new File([processedImageBlob], file.name, { type: 'image/jpeg' }));
      setAvatarBase64(base64String);
      
      toast({
        title: t("Avatar selected"),
        description: t("Click Save to update your profile picture."),
      });
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        variant: "destructive",
        title: t("Failed to process image"),
        description: t("Please try again with another image."),
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Profile")}</CardTitle>
        <CardDescription>{t("Manage your account information.")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-muted bg-muted" onClick={triggerFileInput}>
                  <AvatarImage src={avatarBase64 || ""} alt={user.name} />
                  <AvatarFallback className="text-2xl" key={`profile-avatar-${user.id}`}>{getInitials(user.name)}</AvatarFallback>
                  
                  {/* Overlay com ícone de câmera */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                {/* Indicador de carregamento */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                )}
                
                {/* Input de arquivo oculto */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button" 
                  onClick={triggerFileInput}
                  disabled={uploadingAvatar}
                  className="mt-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingAvatar ? t("Processing...") : t("Upload Photo")}
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Your name")} {...field} />
                  </FormControl>
                  <FormDescription>{t("This is your public display name.")}</FormDescription>
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
                    <Input placeholder={t("Your email")} {...field} />
                  </FormControl>
                  <FormDescription>{t("This is the email associated with your account.")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("Salvando...") : t("Save")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

