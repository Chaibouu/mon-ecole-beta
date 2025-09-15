import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicYearFormWrapper } from "@/components/academic-years/academic-year-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAcademicYearById } from "@/actions/academic-years";
import { notFound } from "next/navigation";

interface EditAcademicYearPageProps {
  params: Promise<{
    id: string;
  }>;

}

export default async function EditAcademicYearPage({ params }: EditAcademicYearPageProps) {
  const { id } = await params;
  const data: any = await getAcademicYearById(id);
  
  if (data?.error || !data?.academicYear) {
    notFound();
  }

  const academicYear = data.academicYear;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
                 <Button variant="ghost" size="sm" asChild>
           <Link href={`/academic-years/${id}`}>
             <ArrowLeft className="mr-2 h-4 w-4" />
             Retour
           </Link>
         </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'année académique</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de l'année académique "{academicYear.name}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'année académique</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearFormWrapper 
            mode="edit" 
            initialData={academicYear}
                         academicYearId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
