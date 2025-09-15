import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Search, Filter, MoreVertical } from "lucide-react"

interface EnhancedTableProps {
  children: React.ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  className?: string
}

export function EnhancedTable({ 
  children, 
  searchable = false, 
  searchPlaceholder = "Rechercher...",
  onSearch,
  className 
}: EnhancedTableProps) {
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
        </div>
      )}
      <div className="rounded-md border bg-background shadow-sm overflow-hidden">
        <Table>
          {children}
        </Table>
      </div>
    </div>
  )
}

interface EnhancedTableHeaderProps {
  children: React.ReactNode
  className?: string
}

export function EnhancedTableHeader({ children, className }: EnhancedTableHeaderProps) {
  return (
    <TableHeader className={cn("bg-muted/50", className)}>
      {children}
    </TableHeader>
  )
}

interface EnhancedTableRowProps {
  children: React.ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
}

export function EnhancedTableRow({ children, className, clickable = false, onClick }: EnhancedTableRowProps) {
  return (
    <TableRow 
      className={cn(
        clickable && "cursor-pointer hover:bg-muted/50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </TableRow>
  )
}

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "actif":
      case "active":
      case "present":
      case "completed":
        return "default"
      case "inactif":
      case "inactive":
      case "absent":
      case "pending":
        return "secondary"
      case "suspendu":
      case "suspended":
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Badge variant={variant || getVariant(status)}>
      {status}
    </Badge>
  )
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
