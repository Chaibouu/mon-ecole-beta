import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomSubjectFormWrapper } from "@/components/classroom-subjects/classroom-subject-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClassroomSubjectById } from "@/actions/classroom-subjects";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";

import { notFound } from "next/navigation";

interface EditClassroomSubjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClassroomSubjectPage({ params }: EditClassroomSubjectPageProps) {
  const { id } = await params;
  
  const [classroomSubjectData, classroomsData, subjectsData] = await Promise.all([
    getClassroomSubjectById(id),
    listClassrooms(),
    listSubjects(),
  ]);

  if (classroomSubjectData?.error || !classroomSubjectData?.classroomSubject) {
    notFound();
  }

  const classroomSubject = classroomSubjectData.classroomSubject;
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/classroom-subjects/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la matière par classe</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de la matière par classe
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la matière par classe</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomSubjectFormWrapper 
            mode="edit"
            initialData={classroomSubject}
            classroomSubjectId={id}
            classrooms={classrooms}
            subjects={subjects}
          />
        </CardContent>
      </Card>
    </div>
  );
}





