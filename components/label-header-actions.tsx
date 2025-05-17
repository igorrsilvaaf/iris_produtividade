"use client"

import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditLabelDialog } from "@/components/edit-label-dialog"
import { DeleteLabelDialog } from "@/components/delete-label-dialog"
import { useTranslation } from "@/lib/i18n"

export function LabelHeaderActions({ label }: { label: any }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: label.color }}></div>
        <h1 className="text-2xl font-bold">{label.name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <EditLabelDialog label={label}>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">{t("Edit Label")}</span>
          </Button>
        </EditLabelDialog>
        <DeleteLabelDialog labelId={label.id} labelName={label.name}>
          <Button variant="outline" size="icon">
            <Trash className="h-4 w-4" />
            <span className="sr-only">{t("Delete Label")}</span>
          </Button>
        </DeleteLabelDialog>
        <AddTaskDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("addTask")}
          </Button>
        </AddTaskDialog>
      </div>
    </div>
  )
} 