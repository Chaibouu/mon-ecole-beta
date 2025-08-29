import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentGradeFormWrapper } from "@/components/student-grades/student-grade-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentGradeById } from "@/actions/student-grades";
import { listStudents } from "@/actions/school-members";
import { listAssessments } from "@/actions/assessments";
import { notFound } from "next/navigation";

interface EditStudentGradePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStudentGradePage({ params }: EditStudentGradePageProps) {
  const { id } = await params;
  
  const [gradeData, studentsData, assessmentsData] = await Promise.all([
    getStudentGradeById(id),
    listStudents(),
    listAssessments(),
  ]);

  if (gradeData?.error || !gradeData?.studentGrade) {
    notFound();
  }

  const grade = gradeData.studentGrade;
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  const assessments = Array.isArray(assessmentsData?.assessments) ? assessmentsData.assessments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/student-grades/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la note</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de la note
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la note</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentGradeFormWrapper 
            mode="edit"
            initialData={grade}
            gradeId={id}
            students={students}
            assessments={assessments}
          />
        </CardContent>
      </Card>
    </div>
  );
}





