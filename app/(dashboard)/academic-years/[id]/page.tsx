import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { getAcademicYearById } from "@/actions/academic-years";
import { notFound } from "next/navigation";

interface AcademicYearDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AcademicYearDetailPage({ params }: AcademicYearDetailPageProps) {
  const { id } = await params;
  const data: any = await getAcademicYearById(id);
  
  if (data?.error || !data?.academicYear) {
    notFound();
  }

  const academicYear = data.academicYear;
  console.log(academicYear)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/academic-years">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{academicYear.name}</h1>
            <p className="text-muted-foreground">
              Détails de l'année académique
            </p>
          </div>
        </div>
                 <Button asChild>
           <Link href={`/academic-years/${id}/edit`}>
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
              <span>{academicYear.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Statut:</span>
              <Badge variant={academicYear.isActive ? "default" : "secondary"}>
                {academicYear.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de début:</span>
              <span>{new Date(academicYear.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date de fin:</span>
              <span>{new Date(academicYear.endDate).toLocaleDateString()}</span>
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
              <span className="font-mono text-sm">{academicYear.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{academicYear.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créée le:</span>
              <span>{academicYear.createdAt ? new Date(academicYear.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifiée le:</span>
              <span>{academicYear.updatedAt ? new Date(academicYear.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
