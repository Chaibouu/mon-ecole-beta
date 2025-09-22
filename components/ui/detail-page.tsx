import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowLeft, Edit, Trash2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface DetailPageProps {
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  backLink?: {
    href: string
    label?: string
  }
  editLink?: {
    href: string
    label?: string
  }
  onDelete?: () => void
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  children: React.ReactNode
  className?: string
}

export function DetailPage({ 
  title, 
  subtitle,
  description, 
  icon: Icon, 
  backLink,
  editLink,
  onDelete,
  badge,
  children,
  className
}: DetailPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {badge && (
                  <Badge variant={badge.variant || "default"}>
                    {badge.text}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-lg text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          {editLink && (
            <Button asChild>
              <Link href={editLink.href}>
                <Edit className="mr-2 h-4 w-4" />
                {editLink.label || "Modifier"}
              </Link>
            </Button>
          )}
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn("grid gap-6", className)}>
        {children}
      </div>
    </div>
  )
}

interface DetailCardProps {
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export function DetailCard({ title, icon: Icon, children, className }: DetailCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

interface DetailFieldProps {
  label: string
  value?: React.ReactNode
  className?: string
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn("flex justify-between items-start", className)}>
      <span className="font-medium text-foreground">{label}:</span>
      <span className="text-muted-foreground text-right max-w-xs">
        {value || "Non renseigné"}
      </span>
    </div>
  )
}

interface MetadataCardProps {
  data: Record<string, any>
  excludeFields?: string[]
  title?: string
  className?: string
}

export function MetadataCard({ 
  data, 
  excludeFields = [], 
  title = "Métadonnées",
  className 
}: MetadataCardProps) {
  const metadataFields = Object.entries(data)
    .filter(([key]) => !excludeFields.includes(key))
    .filter(([key]) => key.includes('Id') || key === 'id' || key.includes('Date'))

  if (metadataFields.length === 0) return null

  return (
    <DetailCard title={title} className={className}>
      <div className="space-y-4">
        {metadataFields.map(([key, value]) => (
          <DetailField
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={
              <span className="font-mono text-sm">
                {typeof value === 'string' && value.length > 20 
                  ? `${value.substring(0, 20)}...` 
                  : String(value)
                }
              </span>
            }
          />
        ))}
      </div>
    </DetailCard>
  )
}





















