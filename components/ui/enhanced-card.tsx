import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  children: React.ReactNode
  gradient?: boolean
  hover?: boolean
}

export function EnhancedCard({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  children, 
  className,
  gradient = false,
  hover = true,
  ...props 
}: EnhancedCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden",
        gradient && "bg-gradient-to-br from-background to-muted/20",
        hover && "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full translate-x-16 -translate-y-16" />
      )}
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {badge && (
            <Badge variant={badge.variant || "default"}>
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  )
}
