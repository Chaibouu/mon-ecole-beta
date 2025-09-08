import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TermFormWrapper } from "@/components/terms/term-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listAcademicYears } from "@/actions/academic-years";

export default async function CreateTermPage() {
  const data: any = await listAcademicYears();
  const academicYears = Array.isArray(data?.academicYears) ? data.academicYears : [];
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/terms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une période</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle période à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du trimestre</CardTitle>
        </CardHeader>
        <CardContent>
          <TermFormWrapper mode="create" academicYears={academicYears} />
        </CardContent>
      </Card>
    </div>
  );
}
