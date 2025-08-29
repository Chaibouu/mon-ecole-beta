import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, BookOpen } from "lucide-react";
import { getSubjectById } from "@/actions/subjects";
import { notFound } from "next/navigation";

interface SubjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const data: any = await getSubjectById(id);

  if (data?.error || !data?.subject) {
    notFound();
  }

  const subject = data.subject;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-muted-foreground">
              Détails de la matière
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/subjects/${id}/edit`}>
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
              <span className="font-medium">Nom:</span>
              <span>{subject.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Code:</span>
              <span>{subject.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Couleur:</span>
              <div className="flex items-center gap-2">
                {subject.color ? (
                  <>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-sm">{subject.color}</span>
                  </>
                ) : (
                  <span>Aucune couleur</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Description:</span>
              <span className="text-right max-w-xs">
                {subject.description || "Aucune description"}
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
              <span className="font-mono text-sm">{subject.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{subject.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{subject.createdAt ? new Date(subject.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{subject.updatedAt ? new Date(subject.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






