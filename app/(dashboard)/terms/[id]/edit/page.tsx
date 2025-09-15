import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TermFormWrapper } from "@/components/terms/term-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTermById } from "@/actions/terms";
import { listAcademicYears } from "@/actions/academic-years";
import { notFound } from "next/navigation";

interface EditTermPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTermPage({ params }: EditTermPageProps) {
  const { id } = await params;
  
  const [termData, academicYearsData] = await Promise.all([
    getTermById(id),
    listAcademicYears()
  ]);

  if (termData?.error || !termData?.term) {
    notFound();
  }

  const term = termData.term;
  const academicYears = Array.isArray(academicYearsData?.academicYears) ? academicYearsData.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/terms/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le trimestre</h1>
          <p className="text-muted-foreground">
            Modifiez les informations du trimestre "{term.name}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du trimestre</CardTitle>
        </CardHeader>
        <CardContent>
                            <TermFormWrapper
                    mode="edit"
                    initialData={term}
                    termId={id}
                    academicYears={academicYears}
                  />
        </CardContent>
      </Card>
    </div>
  );
}
