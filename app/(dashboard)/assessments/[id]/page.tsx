import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Calendar, 
  User, 
  GraduationCap, 
  Clock, 
  Target,
  FileText,
  School,
  UserCheck
} from "lucide-react";
import { getAssessmentById } from "@/actions/assessments";
import { notFound } from "next/navigation";
import { listStudentGrades } from "@/actions/student-grades";
import { getUserBasic } from "@/actions/getUserProfile";

interface AssessmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getTypeBadge = (assessment: any) => {
  const name = assessment?.assessmentType?.name || assessment?.type || "Type";
  return <Badge variant="secondary">{name}</Badge>;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default async function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const { id } = await params;
  const data: any = await getAssessmentById(id);
  const me: any = await getUserBasic();

  if (data?.error || !data?.assessment) {
    notFound();
  }

  const assessment = data.assessment;
  const gradesData: any = await listStudentGrades({ assessmentId: id });
  const grades = Array.isArray(gradesData?.grades) ? gradesData.grades : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'évaluation • {getTypeBadge(assessment)}
            </p>
          </div>
        </div>
        {(me?.user?.role === "ADMIN" || me?.user?.role === "TEACHER") && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/assessments/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/student-grades/create?assessmentId=${id}`}>
                <GraduationCap className="mr-2 h-4 w-4" />
                {grades.length > 0 ? "Modifier les notes" : "Saisir les notes"}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {assessment.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border">
                  {assessment.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Détails de l'évaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <School className="h-4 w-4" />
                    <span>Matière</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {assessment.subject?.name}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>Classe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {assessment.classroom?.name}
                    </Badge>
                    {assessment.classroom?.gradeLevel?.name && (
                      <Badge variant="secondary" className="text-xs">
                        {assessment.classroom.gradeLevel.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Score maximum</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {assessment.maxScore}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    <span>Statut</span>
                  </div>
                  <Badge variant={assessment.isBlocked ? "destructive" : "default"}>
                    {assessment.isBlocked ? "Bloquée" : "Active"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Notes des élèves
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucune note enregistrée pour cette évaluation.</div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2">Élève</th>
                        <th className="text-left p-2">Note</th>
                        <th className="text-left p-2">Sur</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((g: any) => (
                        <tr key={g.id} className="border-t">
                          <td className="p-2">
                            {g.student?.user?.name || `${g.student?.user?.firstName ?? ''} ${g.student?.user?.lastName ?? ''}`.trim() || g.student?.user?.email}
                          </td>
                          <td className="p-2 font-medium">{g.score}</td>
                          <td className="p-2">{assessment.maxScore}</td>
                          <td className="p-2">{new Date(g.createdAt ?? g.gradedAt ?? assessment.assignedAt ?? Date.now()).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Teacher Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Enseignant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">
                  {assessment.createdBy?.user?.name || 
                   (assessment.createdBy?.user?.firstName && assessment.createdBy?.user?.lastName
                     ? `${assessment.createdBy.user.firstName} ${assessment.createdBy.user.lastName}`
                     : 'Enseignant')
                  }
                </div>
                {assessment.createdBy?.user?.email && (
                  <div className="text-sm text-muted-foreground">
                    {assessment.createdBy.user.email}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Assignée le</span>
                </div>
                <div className="font-medium">
                  {assessment.assignedAt ? formatDateTime(assessment.assignedAt) : "Non définie"}
                </div>
              </div>

              {assessment.dueAt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Date limite</span>
                    </div>
                    <div className="font-medium">
                      {formatDateTime(assessment.dueAt)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Term Info */}
          {assessment.term && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trimestre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">
                  {assessment.term.name}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Grades Table */}
          
        </div>
      </div>
    </div>
  );
}





