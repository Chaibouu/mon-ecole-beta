import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicYearFormWrapper } from "@/components/academic-years/academic-year-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateAcademicYearPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/academic-years">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une année académique</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle année scolaire à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'année académique</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearFormWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
