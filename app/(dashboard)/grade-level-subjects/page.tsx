import { listGradeLevelSubjects } from "@/actions/grade-level-subjects";
import { listGradeLevels } from "@/actions/grade-levels";
import { listSubjects } from "@/actions/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeLevelSubjectsTable } from "@/components/grade-level-subjects/grade-level-subjects-table";

export default async function GradeLevelSubjectsPage() {
  const [levelsRes, subjectsRes, coeffsRes]: any = await Promise.all([
    listGradeLevels(),
    listSubjects(),
    listGradeLevelSubjects(),
  ]);

  const gradeLevels = levelsRes?.gradeLevels || [];
  const subjects = subjectsRes?.subjects || [];
  const gradeLevelSubjects = coeffsRes?.gradeLevelSubjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coefficients par niveau</h1>
          <p className="text-muted-foreground">Définissez les coefficients des matières par niveau scolaire.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des coefficients</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeLevelSubjectsTable
            gradeLevels={gradeLevels}
            subjects={subjects}
            items={gradeLevelSubjects}
          />
        </CardContent>
      </Card>
    </div>
  );
}
