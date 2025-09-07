import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  UserCheck, 
  BookOpen, 
  GraduationCap,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import { getClassroomById } from "@/actions/classrooms";
import { notFound } from "next/navigation";
import { StatsCard } from "@/components/ui/stats-card";

interface ClassroomDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClassroomDetailPage({ params }: ClassroomDetailPageProps) {
  const { id } = await params;
  const data: any = await getClassroomById(id);

  if (data?.error || !data?.classroom) {
    notFound();
  }

  const classroom = data.classroom;
  const stats = classroom.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/classrooms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {classroom.gradeLevel?.name || "Niveau non défini"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/classrooms/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Élèves inscrits"
          value={stats.totalStudents?.toString() || "0"}
          icon={Users}
          color="blue"
          description="Élèves dans la classe"
        />
        <StatsCard
          title="Professeurs"
          value={stats.totalTeachers?.toString() || "0"}
          icon={UserCheck}
          color="green"
          description="Enseignants assignés"
        />
        <StatsCard
          title="Matières"
          value={stats.totalSubjects?.toString() || "0"}
          icon={BookOpen}
          color="purple"
          description="Matières enseignées"
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations générales */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Nom de la classe:</span>
                <Badge variant="outline">{classroom.name}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Niveau scolaire:</span>
                <span className="text-sm">{classroom.gradeLevel?.name || "N/A"}</span>
              </div>
              {classroom.room && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Salle:
                  </span>
                  <span className="text-sm">{classroom.room}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-medium text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Créée le:
                </span>
                <span className="text-sm">
                  {classroom.createdAt ? new Date(classroom.createdAt).toLocaleDateString('fr-FR') : "N/A"}
                </span>
              </div>
            </div>
            {classroom.description && (
              <div className="pt-3 border-t">
                <span className="font-medium text-sm">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{classroom.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professeur principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Professeur principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classroom.headTeacher ? (
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={classroom.headTeacher.user?.image || ""} />
                  <AvatarFallback>
                    {classroom.headTeacher.user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{classroom.headTeacher.user?.name || "Nom non renseigné"}</h4>
                  <p className="text-sm text-muted-foreground">{classroom.headTeacher.user?.email}</p>
                  {/* Matière principale retirée du modèle */}
                  {classroom.headTeacher.bio && (
                    <p className="text-sm mt-1">{classroom.headTeacher.bio}</p>
                  )}
                </div>
                <Badge variant="secondary">Professeur principal</Badge>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun professeur principal assigné</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Élèves et Professeurs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Liste des élèves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Élèves inscrits ({stats.totalStudents || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classroom.enrollments && classroom.enrollments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {classroom.enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={enrollment.student.user?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {enrollment.student.user?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {enrollment.student.user?.name || "Nom non renseigné"}
                      </p>
                      {enrollment.student.matricule && (
                        <p className="text-xs text-muted-foreground">
                          Matricule: {enrollment.student.matricule}
                        </p>
                      )}
                    </div>
                    <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                      {enrollment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun élève inscrit</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des professeurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Équipe enseignante ({stats.totalTeachers || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classroom.teacherAssignments && classroom.teacherAssignments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {classroom.teacherAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignment.teacher.user?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {assignment.teacher.user?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {assignment.teacher.user?.name || "Nom non renseigné"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.subject?.name || "Matière non définie"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Enseignant
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun enseignant assigné</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Matières enseignées */}
      {classroom.classroomSubjects && classroom.classroomSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Matières enseignées ({stats.totalSubjects || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {classroom.classroomSubjects.map((cs: any) => (
                <div key={cs.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{cs.subject?.name || "Matière inconnue"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Coeff. {cs.coefficientResolved ?? 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}