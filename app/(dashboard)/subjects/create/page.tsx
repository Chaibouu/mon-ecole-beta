import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectFormWrapper } from "@/components/subjects/subject-form-wrapper";
import { listSubjectCategories } from "@/actions/subject-categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateSubjectPage() {
  const catsRes: any = await listSubjectCategories();
  const categories = Array.isArray(catsRes?.subjectCategories) ? catsRes.subjectCategories : [];
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/subjects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une matière</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle matière scolaire à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la matière</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectFormWrapper mode="create" categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}








