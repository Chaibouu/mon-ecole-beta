import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap } from "lucide-react";
import { getTeacherById } from "@/actions/school-members";
import { notFound } from "next/navigation";

interface TeacherDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params;
  const data: any = await getTeacherById(id);

  if (data?.error || !data?.teacher) {
    notFound();
  }

  const teacher = data.teacher;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teachers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{`${teacher.lastName} ${teacher.firstName}`}</h1>
            <p className="text-muted-foreground">
              Détails du professeur
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/teachers/${id}/edit`}>
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
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Nom complet:</span>
              <span>{`${teacher.lastName} ${teacher.firstName}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{teacher.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Téléphone:</span>
              <span>{teacher.phone || "Non renseigné"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de naissance:</span>
              <span>
                {teacher.dateOfBirth 
                  ? new Date(teacher.dateOfBirth).toLocaleDateString("fr-FR")
                  : "Non renseignée"
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date d'embauche:</span>
              <span>
                {teacher.hireDate 
                  ? new Date(teacher.hireDate).toLocaleDateString("fr-FR")
                  : "Non renseignée"
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Spécialisation:</span>
              <span className="text-right max-w-xs">
                {teacher.specialization || "Non renseignée"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biographie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {teacher.bio || "Aucune biographie renseignée"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{teacher.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{teacher.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{teacher.updatedAt ? new Date(teacher.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

