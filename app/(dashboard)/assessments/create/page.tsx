import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentFormWrapper } from "@/components/assessments/assessment-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";
import { listTerms } from "@/actions/terms";

export default async function CreateAssessmentPage() {
  const [classroomsData, subjectsData, termsData] = await Promise.all([
    listClassrooms(),
    listSubjects(),
    listTerms(),
  ]);
  
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];
  const terms = Array.isArray(termsData?.terms) ? termsData.terms : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assessments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une évaluation</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle évaluation ou examen
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'évaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentFormWrapper 
            mode="create"
            classrooms={classrooms}
            subjects={subjects}
            terms={terms}
          />
        </CardContent>
      </Card>
    </div>
  );
}





