import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap } from "lucide-react";
import { getGradeLevelById } from "@/actions/grade-levels";
import { notFound } from "next/navigation";
import { listSubjects } from "@/actions/subjects";
import { listGradeLevelSubjects } from "@/actions/grade-level-subjects";
import { GradeLevelSubjectsTable } from "@/components/grade-level-subjects/grade-level-subjects-table";

interface GradeLevelDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GradeLevelDetailPage({ params }: GradeLevelDetailPageProps) {
  const { id } = await params;
  const data: any = await getGradeLevelById(id);
  
  if (data?.error || !data?.gradeLevel) {
    notFound();
  }

  const gradeLevel = data.gradeLevel;

  // Charger matières et coefficients filtrés sur ce niveau
  const [subjectsRes, coeffsRes]: any = await Promise.all([
    listSubjects(),
    listGradeLevelSubjects({ gradeLevelId: id }),
  ]);
  const subjects = subjectsRes?.subjects || [];
  const gradeLevelSubjects = coeffsRes?.gradeLevelSubjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/grade-levels">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{gradeLevel.name}</h1>
            <p className="text-muted-foreground">
              Détails du niveau scolaire
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/grade-levels/${id}/edit`}>
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
              <span className="font-medium">Nom:</span>
              <span>{gradeLevel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Description:</span>
              <span className="text-right max-w-xs">
                {gradeLevel.description || "Aucune description"}
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
              <span className="font-mono text-sm">{gradeLevel.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{gradeLevel.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{gradeLevel.createdAt ? new Date(gradeLevel.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{gradeLevel.updatedAt ? new Date(gradeLevel.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglet Coefficients (simple section) */}
      <Card>
        <CardHeader>
          <CardTitle>Coefficients par matière</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeLevelSubjectsTable
            gradeLevels={[gradeLevel]}
            subjects={subjects}
            items={gradeLevelSubjects}
          />
        </CardContent>
      </Card>
    </div>
  );
}
