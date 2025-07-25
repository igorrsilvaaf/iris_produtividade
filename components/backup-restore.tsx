"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslation } from "@/lib/i18n"

interface BackupRestoreProps {
  initialLanguage: string;
}

export function BackupRestore({ initialLanguage }: BackupRestoreProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { t, setLanguage } = useTranslation()

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage as "en" | "pt");
    }
  }, [initialLanguage, setLanguage]);

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/backup/export")

      if (!response.ok) {
        throw new Error(t("Failed to export data"))
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")

      const contentDisposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : "iris-backup.json";

      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t("Export successful"),
        description: t("Your data has been exported successfully."),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Export failed"),
        description: t("Failed to export your data. Please try again."),
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast({
        variant: "destructive",
        title: t("No file selected"),
        description: t("Please select a backup file to import."),
      })
      return
    }

    setIsImporting(true)
    try {
      const fileContent = await importFile.text()
      let data

      try {
        data = JSON.parse(fileContent)
      } catch (e) {
        throw new Error(t("Invalid backup file format"))
      }

      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t("Failed to import data"))
      }

      toast({
        title: t("Import successful"),
        description: t("Your data has been imported successfully."),
      })

      setShowImportDialog(false)
      setImportFile(null)

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Import failed"),
        description: error.message || t("Failed to import your data. Please try again."),
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Backup & Restore")}</CardTitle>
        <CardDescription>{t("Export your data or restore from a backup file.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("Export Data")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("Download a backup of all your tasks, projects, labels, and settings.")}
          </p>
          <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto" data-testid="export-button">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Exporting...")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> {t("Export Data")}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("Import Data")}</h3>
          <p className="text-sm text-muted-foreground">{t("Restore your data from a previously exported backup file.")}</p>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" data-testid="import-button">
                <Upload className="mr-2 h-4 w-4" /> {t("Import Data")}
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="import-dialog">
              <DialogHeader>
                <DialogTitle>{t("Import Data")}</DialogTitle>
                <DialogDescription>
                  {t("Upload a backup file to restore your data. This will not delete your existing data, but may overwrite items with the same name.")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <AlertTitle>{t("Warning")}</AlertTitle>
                  <AlertDescription>
                    {t("Importing data will merge with your existing data. Make sure to export your current data first if you want to keep it.")}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <label htmlFor="backup-file" className="text-sm font-medium">
                    {t("Backup File")}
                  </label>
                  <input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    data-testid="backup-file-input"
                    className="w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)} disabled={isImporting} data-testid="cancel-import-button">
                  {t("Cancel")}
                </Button>
                <Button onClick={handleImport} disabled={!importFile || isImporting} data-testid="confirm-import-button">
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Importing...")}
                    </>
                  ) : (
                    t("Import")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("Note: Backup files contain all your tasks, projects, labels, and settings. They do not include your account information.")}
        </p>
      </CardFooter>
    </Card>
  )
}

