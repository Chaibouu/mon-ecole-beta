import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { getParentById } from "@/actions/parents";
import { listStudents } from "@/actions/school-members";
import { notFound } from "next/navigation";
import { ParentFormWrapper } from "@/components/parents/parent-form-wrapper";

interface EditParentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditParentPage({ params }: EditParentPageProps) {
  const { id } = await params;
  const [parentData, studentsData]: any = await Promise.all([
    getParentById(id),
    listStudents(),
  ]);

  if (parentData?.error || !parentData?.parent) {
    notFound();
  }

  const parent = parentData.parent;
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/parents/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier {parent.user?.name || "le parent"}
          </h1>
          <p className="text-muted-foreground">
            Modifiez les informations du parent d'élève
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informations du parent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ParentFormWrapper 
            initialData={parent} 
            students={students}
            mode="edit"
            parentId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
