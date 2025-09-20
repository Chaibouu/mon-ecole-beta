import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  backLink?: {
    href: string
    label?: string
  }
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  badge,
  backLink,
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
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
                  <Badge variant={badge.variant || "default"} className="text-xs">
                    {badge.text}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-muted-foreground mt-1 text-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}




















