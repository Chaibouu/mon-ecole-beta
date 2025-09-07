import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectFormWrapper } from "@/components/subjects/subject-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSubjectById } from "@/actions/subjects";
import { notFound } from "next/navigation";
import { listSubjectCategories } from "@/actions/subject-categories";

interface EditSubjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const { id } = await params;
  const [data, catsRes]: any = await Promise.all([
    getSubjectById(id),
    listSubjectCategories(),
  ]);

  if (data?.error || !data?.subject) {
    notFound();
  }

  const subject = data.subject;
  const categories = Array.isArray(catsRes?.subjectCategories) ? catsRes.subjectCategories : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/subjects/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la matière</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de la matière "{subject.name}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la matière</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectFormWrapper
            mode="edit"
            initialData={subject}
            subjectId={id}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}






