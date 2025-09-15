import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolFormWrapper } from "@/components/schools/school-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateSchoolPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/schools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une école</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouvel établissement scolaire à la plateforme
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'école</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolFormWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
