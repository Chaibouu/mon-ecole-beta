import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "indigo" | "emerald" | "teal" | "cyan"
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = "blue",
  className 
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  }

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    teal: "text-teal-600",
    cyan: "text-cyan-600",
  }

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                  {trend.label && (
                    <span className="text-muted-foreground ml-1">{trend.label}</span>
                  )}
                </div>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-xl",
              colorClasses[color]
            )}>
              <Icon className={cn("h-6 w-6", iconColorClasses[color])} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}






