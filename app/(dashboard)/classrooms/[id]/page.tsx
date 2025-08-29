import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Users } from "lucide-react";
import { getClassroomById } from "@/actions/classrooms";
import { notFound } from "next/navigation";

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

  return (
    <div className="space-y-6">
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
            <p className="text-muted-foreground">
              Détails de la classe
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
              <span className="font-medium">Nom:</span>
              <span>{classroom.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Niveau scolaire:</span>
              <span>{classroom.gradeLevel?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Description:</span>
              <span className="text-right max-w-xs">
                {classroom.description || "Aucune description"}
              </span>
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
              <span className="font-mono text-sm">{classroom.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{classroom.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Niveau scolaire ID:</span>
              <span className="font-mono text-sm">{classroom.gradeLevelId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{classroom.createdAt ? new Date(classroom.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{classroom.updatedAt ? new Date(classroom.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

