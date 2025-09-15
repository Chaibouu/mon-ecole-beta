import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Calendar, User, BookOpen } from "lucide-react";
import { getEnrollmentById } from "@/actions/enrollments";
import { notFound } from "next/navigation";

interface EnrollmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="default">Actif</Badge>;
    case "INACTIVE":
      return <Badge variant="secondary">Inactif</Badge>;
    case "GRADUATED":
      return <Badge variant="outline">Diplômé</Badge>;
    case "TRANSFERRED":
      return <Badge variant="destructive">Transféré</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

export default async function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { id } = await params;
  const data: any = await getEnrollmentById(id);

  if (data?.error || !data?.enrollment) {
    notFound();
  }

  const enrollment = data.enrollment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/enrollments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inscription - {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'inscription élève
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/enrollments/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Élève:</span>
              <span>
                {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{enrollment.student?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {enrollment.classroom?.name} ({enrollment.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique:</span>
              <Badge variant="outline">{enrollment.academicYear?.name}</Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Statut:</span>
              {getStatusBadge(enrollment.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes et métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{enrollment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Élève ID:</span>
              <span className="font-mono text-sm">{enrollment.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{enrollment.classroomId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique ID:</span>
              <span className="font-mono text-sm">{enrollment.academicYearId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





