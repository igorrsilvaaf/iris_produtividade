"use client"

import { useState } from 'react'
import { Plus, Edit, Trash2, GripVertical, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDynamicColumns } from '@/hooks/use-dynamic-columns'
import { useTranslation } from '@/lib/i18n'

// Tipo para colunas vindas do banco de dados
interface DynamicColumn {
  id: string
  title: string
  color: string
  order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

// Componente para criar nova coluna
export function CreateColumnDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#6b7280')
  const [isLoading, setIsLoading] = useState(false)
  const { createColumn } = useDynamicColumns()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await createColumn(title.trim(), color)
      setTitle('')
      setColor('#6b7280')
      setOpen(false)
    } catch {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Create New Column')}</DialogTitle>
          <DialogDescription>
            {t('Add a new column to your Kanban board')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('Title')}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder={t('Enter column title')}
                maxLength={50}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                {t('Color')}
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? t('Creating...') : t('Create Column')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para editar coluna
export function EditColumnDialog({ 
  column, 
  children 
}: { 
  column: DynamicColumn
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [color, setColor] = useState(column.color)
  const [isLoading, setIsLoading] = useState(false)
  const { updateColumn } = useDynamicColumns()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await updateColumn(column.id, { title: title.trim(), color })
      setOpen(false)
    } catch {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Edit Column')}</DialogTitle>
          <DialogDescription>
            {t('Update column title and color')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                {t('Title')}
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder={t('Enter column title')}
                maxLength={50}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                {t('Color')}
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  id="edit-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? t('Updating...') : t('Update Column')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para deletar coluna
export function DeleteColumnDialog({ 
  column, 
  children 
}: { 
  column: DynamicColumn
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { deleteColumn } = useDynamicColumns()
  const { t } = useTranslation()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteColumn(column.id)
      setOpen(false)
    } catch {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Delete Column')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to delete the column "' + column.title + '"? This action cannot be undone.')}
            {column.is_default && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                ⚠️ {t('This is a default column and cannot be deleted.')}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || column.is_default}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('Deleting...') : t('Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Menu de ações da coluna
export function ColumnActionsMenu({ column }: { column: DynamicColumn }) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('Column actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditColumnDialog column={column}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            {t('Edit')}
          </DropdownMenuItem>
        </EditColumnDialog>
        {!column.is_default && (
          <DeleteColumnDialog column={column}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('Delete')}
            </DropdownMenuItem>
          </DeleteColumnDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Botão para adicionar nova coluna
export function AddColumnButton() {
  const { t } = useTranslation()

  return (
    <CreateColumnDialog>
      <Button
        variant="outline"
        className="w-[250px] h-[100px] border-dashed border-2 flex-none md:w-[270px] lg:w-[280px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm font-medium">{t('Add Column')}</span>
      </Button>
    </CreateColumnDialog>
  )
}