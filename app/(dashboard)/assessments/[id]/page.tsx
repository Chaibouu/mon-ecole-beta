import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, BookOpen, Calendar, User, GraduationCap } from "lucide-react";
import { getAssessmentById } from "@/actions/assessments";
import { notFound } from "next/navigation";

interface AssessmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "EXAM":
      return <Badge variant="destructive">Examen</Badge>;
    case "QUIZ":
      return <Badge variant="secondary">Quiz</Badge>;
    case "HOMEWORK":
      return <Badge variant="outline">Devoir</Badge>;
    case "PROJECT":
      return <Badge variant="default">Projet</Badge>;
    case "PRESENTATION":
      return <Badge variant="secondary">Présentation</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

export default async function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const { id } = await params;
  const data: any = await getAssessmentById(id);

  if (data?.error || !data?.assessment) {
    notFound();
  }

  const assessment = data.assessment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'évaluation
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/assessments/${id}/edit`}>
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
              <span className="font-medium">Titre:</span>
              <span>{assessment.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              {getTypeBadge(assessment.type)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière:</span>
              <Badge variant="secondary">{assessment.subject?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {assessment.classroom?.name} ({assessment.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Coefficient:</span>
              <span>{assessment.coefficient}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Assignée le:</span>
              <span>{assessment.assignedAt ? formatDate(assessment.assignedAt) : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date limite:</span>
              <span>{assessment.dueAt ? formatDate(assessment.dueAt) : "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description et notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {assessment.description}
                </p>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{assessment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant ID:</span>
              <span className="font-mono text-sm">{assessment.createdById}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière ID:</span>
              <span className="font-mono text-sm">{assessment.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{assessment.classroomId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





