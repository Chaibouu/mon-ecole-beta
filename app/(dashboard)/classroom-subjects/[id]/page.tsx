import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, BookOpen, GraduationCap, Clock, Calendar } from "lucide-react";
import { getClassroomSubjectById } from "@/actions/classroom-subjects";
import { notFound } from "next/navigation";

interface ClassroomSubjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClassroomSubjectDetailPage({ params }: ClassroomSubjectDetailPageProps) {
  const { id } = await params;
  const data: any = await getClassroomSubjectById(id);

  if (data?.error || !data?.classroomSubject) {
    notFound();
  }

  const classroomSubject = data.classroomSubject;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/classroom-subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {classroomSubject.subject?.name} - {classroomSubject.classroom?.name}
            </h1>
            <p className="text-muted-foreground">
              Détails de la matière par classe
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/classroom-subjects/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {classroomSubject.classroom?.name} ({classroomSubject.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière:</span>
              <Badge variant="secondary">{classroomSubject.subject?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique:</span>
              <Badge variant="outline">{classroomSubject.academicYear?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Heures par semaine:</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {classroomSubject.hoursPerWeek}h/sem
              </span>
            </div>
            {classroomSubject.classroom?.description && (
              <div className="flex justify-between">
                <span className="font-medium">Description de la classe:</span>
                <span className="text-sm text-muted-foreground max-w-xs text-right">
                  {classroomSubject.classroom.description}
                </span>
              </div>
            )}
            {classroomSubject.subject?.description && (
              <div className="flex justify-between">
                <span className="font-medium">Description de la matière:</span>
                <span className="text-sm text-muted-foreground max-w-xs text-right">
                  {classroomSubject.subject.description}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description et métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classroomSubject.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {classroomSubject.description}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{classroomSubject.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{classroomSubject.classroomId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière ID:</span>
              <span className="font-mono text-sm">{classroomSubject.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique ID:</span>
              <span className="font-mono text-sm">{classroomSubject.academicYearId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





