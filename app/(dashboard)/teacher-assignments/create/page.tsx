import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherAssignmentFormWrapper } from "@/components/teacher-assignments/teacher-assignment-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTeachers } from "@/actions/school-members";
import { listSubjects } from "@/actions/subjects";
import { listClassrooms } from "@/actions/classrooms";
import { listAcademicYears } from "@/actions/academic-years";

export default async function CreateTeacherAssignmentPage() {
  const [teachersData, subjectsData, classroomsData, academicYearsData] = await Promise.all([
    listTeachers(),
    listSubjects(),
    listClassrooms(),
    listAcademicYears(),
  ]);

  const teachers = Array.isArray(teachersData?.teachers) ? teachersData.teachers : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const academicYears = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher-assignments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une affectation</h1>
          <p className="text-muted-foreground">
            Affectez un enseignant à une matière et une classe
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'affectation</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherAssignmentFormWrapper 
            mode="create"
            teachers={teachers}
            subjects={subjects}
            classrooms={classrooms}
            academicYears={academicYears}
          />
        </CardContent>
      </Card>
    </div>
  );
}
