import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSubjectCategoryById } from "@/actions/subject-categories";
import { notFound } from "next/navigation";
import { SubjectCategoryFormWrapper } from "@/components/subject-categories/subject-category-form-wrapper";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubjectCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const data: any = await getSubjectCategoryById(id);
  if (data?.error || !data?.subjectCategory) {
    notFound();
  }
  const category = data.subjectCategory;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/subject-categories/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
          <p className="text-muted-foreground">Modifiez les informations de la catégorie "{category.name}"</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectCategoryFormWrapper mode="edit" initialData={category} categoryId={id} />
        </CardContent>
      </Card>
    </div>
  );
}




