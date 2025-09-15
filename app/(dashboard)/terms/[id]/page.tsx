import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { getTermById } from "@/actions/terms";
import { notFound } from "next/navigation";

interface TermDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TermDetailPage({ params }: TermDetailPageProps) {
  const { id } = await params;
  const data: any = await getTermById(id);
 
  
  if (data?.error || !data?.term) {
    notFound();
  }

  const term = data.term;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/terms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{term.name}</h1>
            <p className="text-muted-foreground">
              Détails du trimestre
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/terms/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Nom:</span>
              <span>{term.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Année académique:</span>
              <span>{term.academicYear?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de début:</span>
              <span>{new Date(term.startDate).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de fin:</span>
              <span>{new Date(term.endDate).toLocaleDateString("fr-FR")}</span>
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
              <span className="font-mono text-sm">{term.id}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{term.schoolId}</span>
            </div> */}
            {/* <div className="flex justify-between">
              <span className="font-medium">Année académique ID:</span>
              <span className="font-mono text-sm">{term.academicYearId}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{term.createdAt ? new Date(term.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{term.updatedAt ? new Date(term.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
