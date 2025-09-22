import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubjectCategoryFormWrapper } from "@/components/subject-categories/subject-category-form-wrapper";

export default function CreateSubjectCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/subject-categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une catégorie</h1>
          <p className="text-muted-foreground">Ajoutez une nouvelle catégorie de matière</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectCategoryFormWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
















