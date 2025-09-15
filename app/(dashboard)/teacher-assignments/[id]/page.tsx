import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Users, BookOpen, GraduationCap, Calendar } from "lucide-react";
import { getTeacherAssignmentById } from "@/actions/teacher-assignments";
import { notFound } from "next/navigation";

interface TeacherAssignmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherAssignmentDetailPage({ params }: TeacherAssignmentDetailPageProps) {
  const { id } = await params;
  const data: any = await getTeacherAssignmentById(id);

  if (data?.error || !data?.teacherAssignment) {
    notFound();
  }

  const assignment = data.teacherAssignment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher-assignments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Affectation - {assignment.teacher?.user?.firstName} {assignment.teacher?.user?.lastName}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'affectation enseignant
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/teacher-assignments/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Enseignant:</span>
              <span>
                {assignment.teacher?.user?.firstName} {assignment.teacher?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{assignment.teacher?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière:</span>
              <Badge variant="secondary">{assignment.subject?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {assignment.classroom?.name} ({assignment.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique:</span>
              <Badge variant="outline">{assignment.academicYear?.name}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{assignment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant ID:</span>
              <span className="font-mono text-sm">{assignment.teacherId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière ID:</span>
              <span className="font-mono text-sm">{assignment.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{assignment.classroomId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique ID:</span>
              <span className="font-mono text-sm">{assignment.academicYearId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





