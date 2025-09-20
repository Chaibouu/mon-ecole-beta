import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentFormWrapper } from "@/components/enrollments/enrollment-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listStudents } from "@/actions/school-members";
import { listClassrooms } from "@/actions/classrooms";
import { listAcademicYears } from "@/actions/academic-years";

export default async function CreateEnrollmentPage() {
  const [studentsData, classroomsData, academicYearsData] = await Promise.all([
    listStudents(),
    listClassrooms(),
    listAcademicYears(),
  ]);

  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const academicYears = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/enrollments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une inscription</h1>
          <p className="text-muted-foreground">
            Inscrivez un élève dans une classe pour une année académique
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentFormWrapper 
            mode="create"
            students={students}
            classrooms={classrooms}
            academicYears={academicYears}
          />
        </CardContent>
      </Card>
    </div>
  );
}




















