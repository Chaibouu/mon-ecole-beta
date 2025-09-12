import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"

interface EnhancedFormProps {
  title: string
  description?: string
  icon?: LucideIcon
  backLink?: {
    href: string
    label?: string
  }
  children: React.ReactNode
  className?: string
  onCancel?: () => void
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function EnhancedForm({ 
  title, 
  description, 
  icon: Icon, 
  backLink,
  children,
  className,
  onCancel,
  isLoading = false,
  mode = "create"
}: EnhancedFormProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {backLink && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={backLink.href}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLink.label || "Retour"}
            </Link>
          </Button>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-lg">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className={cn("max-w-4xl", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>
              {mode === "create" ? "Nouvelles informations" : "Modifier les informations"}
            </CardTitle>
            <Badge variant={mode === "create" ? "default" : "secondary"}>
              {mode === "create" ? "Création" : "Modification"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

interface FormActionsProps {
  onCancel?: () => void
  cancelText?: string
  submitText?: string
  isLoading?: boolean
  canSubmit?: boolean
  className?: string
}

export function FormActions({ 
  onCancel, 
  cancelText = "Annuler",
  submitText = "Enregistrer",
  isLoading = false,
  canSubmit = true,
  className 
}: FormActionsProps) {
  return (
    <div className={cn("flex justify-end space-x-4 pt-6 border-t", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="min-w-[100px]"
      >
        <X className="mr-2 h-4 w-4" />
        {cancelText}
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || !canSubmit}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {submitText}
          </>
        )}
      </Button>
    </div>
  )
}

















