import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Calendar, User, BookOpen } from "lucide-react";
import { getStudentGradeById } from "@/actions/student-grades";
import { notFound } from "next/navigation";

interface StudentGradeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const getScoreBadge = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) {
    return <Badge variant="default">{score}/{maxScore}</Badge>;
  } else if (percentage >= 60) {
    return <Badge variant="secondary">{score}/{maxScore}</Badge>;
  } else if (percentage >= 40) {
    return <Badge variant="outline">{score}/{maxScore}</Badge>;
  } else {
    return <Badge variant="destructive">{score}/{maxScore}</Badge>;
  }
};

export default async function StudentGradeDetailPage({ params }: StudentGradeDetailPageProps) {
  const { id } = await params;
  const data: any = await getStudentGradeById(id);

  if (data?.error || !data?.studentGrade) {
    notFound();
  }

  const grade = data.studentGrade;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student-grades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Note - {grade.student?.user?.firstName} {grade.student?.user?.lastName}
            </h1>
            <p className="text-muted-foreground">
              Détails de la note
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/student-grades/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Élève:</span>
              <span>
                {grade.student?.user?.firstName} {grade.student?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{grade.student?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Évaluation:</span>
              <span>{grade.assessment?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <Badge variant="secondary">{grade.assessment?.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière:</span>
              <Badge variant="secondary">{grade.assessment?.teacherAssignment?.subject?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {grade.assessment?.teacherAssignment?.classroom?.name} ({grade.assessment?.teacherAssignment?.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Score:</span>
              {getScoreBadge(grade.score, grade.assessment?.maxScore || 20)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant qui note:</span>
              <span>
                {grade.gradedByTeacher?.user?.firstName} {grade.gradedByTeacher?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de notation:</span>
              <span>{formatDate(grade.gradedAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commentaires et métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grade.comments && (
              <div>
                <span className="font-medium">Commentaires:</span>
                <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {grade.comments}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{grade.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Élève ID:</span>
              <span className="font-mono text-sm">{grade.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Évaluation ID:</span>
              <span className="font-mono text-sm">{grade.assessmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant ID:</span>
              <span className="font-mono text-sm">{grade.gradedBy}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





