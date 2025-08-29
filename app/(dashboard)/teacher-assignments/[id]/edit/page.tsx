import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherAssignmentFormWrapper } from "@/components/teacher-assignments/teacher-assignment-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeacherAssignmentById } from "@/actions/teacher-assignments";
import { listTeachers } from "@/actions/school-members";
import { listSubjects } from "@/actions/subjects";
import { listClassrooms } from "@/actions/classrooms";
import { listAcademicYears } from "@/actions/academic-years";
import { notFound } from "next/navigation";

interface EditTeacherAssignmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTeacherAssignmentPage({ params }: EditTeacherAssignmentPageProps) {
  const { id } = await params;
  
  const [assignmentData, teachersData, subjectsData, classroomsData, academicYearsData] = await Promise.all([
    getTeacherAssignmentById(id),
    listTeachers(),
    listSubjects(),
    listClassrooms(),
    listAcademicYears(),
  ]);

  if (assignmentData?.error || !assignmentData?.teacherAssignment) {
    notFound();
  }

  const assignment = assignmentData.teacherAssignment;
  const teachers = Array.isArray(teachersData?.teachers) ? teachersData.teachers : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const academicYears = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/teacher-assignments/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'affectation</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de l'affectation enseignant
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'affectation</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherAssignmentFormWrapper 
            mode="edit"
            initialData={assignment}
            assignmentId={id}
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
