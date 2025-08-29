import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherFormWrapper } from "@/components/teachers/teacher-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeacherById } from "@/actions/school-members";
import { notFound } from "next/navigation";

interface EditTeacherPageProps {
  params:Promise<{
    id: string;
  }>;
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { id } = await params;
  const data: any = await getTeacherById(id);

  if (data?.error || !data?.teacher) {
    notFound();
  }

  const teacher = data.teacher;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/teachers/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le professeur</h1>
          <p className="text-muted-foreground">
            Modifiez les informations du professeur "{teacher.lastName} {teacher.firstName}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du professeur</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherFormWrapper
            mode="edit"
            initialData={teacher}
            teacherId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

