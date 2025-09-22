"use client";

import { SchoolCategory, GradeLevel } from "@prisma/client";
import { GradeLevelCategoryBadge } from "./grade-level-category-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users } from "lucide-react";

interface GradeLevelsByCategoryProps {
  gradeLevels: (GradeLevel & { 
    _count: { 
      classrooms: number;
    };
  })[];
}

export function GradeLevelsByCategory({ gradeLevels }: GradeLevelsByCategoryProps) {
  // Grouper les niveaux par catégorie
  const groupedLevels = gradeLevels.reduce((acc, level) => {
    if (!acc[level.category]) {
      acc[level.category] = [];
    }
    acc[level.category].push(level);
    return acc;
  }, {} as Record<SchoolCategory, typeof gradeLevels>);

  // Trier les niveaux dans chaque catégorie par nom
  Object.keys(groupedLevels).forEach(category => {
    groupedLevels[category as SchoolCategory].sort((a, b) => a.name.localeCompare(b.name));
  });

  const categories: SchoolCategory[] = ["COLLEGE", "LYCEE"];

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const levels = groupedLevels[category] || [];
        if (levels.length === 0) return null;

        return (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {category === "COLLEGE" ? "Collège" : "Lycée"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {levels.length} niveau{levels.length > 1 ? "x" : ""}
                    </p>
                  </div>
                </div>
                <GradeLevelCategoryBadge category={category} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {levels.map(level => (
                  <div
                    key={level.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{level.name}</h4>
                    </div>
                    
                    {level.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{level._count.classrooms} classe{level._count.classrooms > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
