import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchoolFormWrapper } from "@/components/schools/school-form-wrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSchoolById } from "@/actions/schools";

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  const { id } = await params;
  const result: any = await getSchoolById(id);
  
  if (result?.error || !result?.school) {
    notFound();
  }

  const school = result.school;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/schools/${school.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'école</h1>
          <p className="text-muted-foreground">{school.name}</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'école</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolFormWrapper 
            mode="edit" 
            initialData={school} 
            schoolId={school.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
