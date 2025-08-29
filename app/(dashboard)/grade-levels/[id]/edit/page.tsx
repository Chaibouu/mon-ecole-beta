import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeLevelFormWrapper } from "@/components/grade-levels/grade-level-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGradeLevelById } from "@/actions/grade-levels";
import { notFound } from "next/navigation";

interface EditGradeLevelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGradeLevelPage({ params }: EditGradeLevelPageProps) {
  const { id } = await params;
  const data: any = await getGradeLevelById(id);
  
  if (data?.error || !data?.gradeLevel) {
    notFound();
  }

  const gradeLevel = data.gradeLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/grade-levels/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le niveau scolaire</h1>
          <p className="text-muted-foreground">
            Modifiez les informations du niveau scolaire "{gradeLevel.name}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du niveau scolaire</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeLevelFormWrapper 
            mode="edit" 
            initialData={gradeLevel}
            gradeLevelId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}






