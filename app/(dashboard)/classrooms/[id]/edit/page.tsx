import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomFormWrapper } from "@/components/classrooms/classroom-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClassroomById } from "@/actions/classrooms";
import { listGradeLevels } from "@/actions/grade-levels";
import { listTeachers } from "@/actions/school-members";
import { notFound } from "next/navigation";

interface EditClassroomPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClassroomPage({ params }: EditClassroomPageProps) {
  const { id } = await params;
  
  const [classroomData, gradeLevelsData, teachersRes] = await Promise.all([
    getClassroomById(id),
    listGradeLevels(),
    listTeachers(),
  ]);

  if (classroomData?.error || !classroomData?.classroom) {
    notFound();
  }

  const classroom = { ...classroomData.classroom, __teachers: Array.isArray(teachersRes?.teachers) ? teachersRes.teachers : [] };
  const gradeLevels = Array.isArray(gradeLevelsData?.gradeLevels) ? gradeLevelsData.gradeLevels : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/classrooms/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la classe</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de la classe "{classroom.name}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la classe</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomFormWrapper
            mode="edit"
            initialData={classroom}
            classroomId={id}
            gradeLevels={gradeLevels}
          />
        </CardContent>
      </Card>
    </div>
  );
}






