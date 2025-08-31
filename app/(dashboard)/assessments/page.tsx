import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentsTableWrapper } from "@/components/assessments/assessments-table-wrapper";
import { listAssessments } from "@/actions/assessments";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

export default async function AssessmentsPage() {
  const data: any = await listAssessments();
  if (data?.error) {
    throw new Error(data.error);
  }

  const assessments = Array.isArray(data?.assessments) ? data.assessments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Évaluations</h1>
          <p className="text-muted-foreground">
            Gérez les évaluations et examens
          </p>
        </div>
        <Button asChild>
          <Link href="/assessments/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une évaluation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Liste des évaluations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentsTableWrapper initialAssessments={assessments} />
        </CardContent>
      </Card>
    </div>
  );
}







