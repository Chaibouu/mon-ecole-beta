import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicYearsTableWrapper } from "@/components/academic-years/academic-years-table-wrapper";
import { listAcademicYears } from "@/actions/academic-years";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AcademicYearsPage() {
  const data: any = await listAcademicYears();
  if (data?.error) {
    throw new Error(data.error);
  }

  const academicYears = Array.isArray(data?.academicYears) ? data.academicYears : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Années Académiques</h1>
          <p className="text-muted-foreground">
            Gérez les années scolaires de votre établissement
          </p>
        </div>
        <Button asChild>
          <Link href="/academic-years/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une année académique
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des années académiques</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearsTableWrapper initialAcademicYears={academicYears} />
        </CardContent>
      </Card>
    </div>
  );
}
