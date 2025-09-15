import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentFormWrapper } from "@/components/enrollments/enrollment-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEnrollmentById } from "@/actions/enrollments";
import { listStudents } from "@/actions/school-members";
import { listClassrooms } from "@/actions/classrooms";
import { listAcademicYears } from "@/actions/academic-years";
import { notFound } from "next/navigation";

interface EditEnrollmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEnrollmentPage({ params }: EditEnrollmentPageProps) {
  const { id } = await params;
  
  const [enrollmentData, studentsData, classroomsData, academicYearsData] = await Promise.all([
    getEnrollmentById(id),
    listStudents(),
    listClassrooms(),
    listAcademicYears(),
  ]);

  if (enrollmentData?.error || !enrollmentData?.enrollment) {
    notFound();
  }

  const enrollment = enrollmentData.enrollment;
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const academicYears = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/enrollments/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'inscription</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de l'inscription élève
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentFormWrapper 
            mode="edit"
            initialData={enrollment}
            enrollmentId={id}
            students={students}
            classrooms={classrooms}
            academicYears={academicYears}
          />
        </CardContent>
      </Card>
    </div>
  );
}





