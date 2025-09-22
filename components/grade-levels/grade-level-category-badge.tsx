"use client";

import { Badge } from "@/components/ui/badge";
import { SchoolCategory } from "@prisma/client";

interface GradeLevelCategoryBadgeProps {
  category: SchoolCategory;
  className?: string;
}

export function GradeLevelCategoryBadge({ 
  category, 
  className = "" 
}: GradeLevelCategoryBadgeProps) {
  const categoryConfig = {
    COLLEGE: {
      label: "Collège",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    LYCEE: {
      label: "Lycée", 
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

  const config = categoryConfig[category] || categoryConfig.COLLEGE;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
