import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomSubjectFormWrapper } from "@/components/classroom-subjects/classroom-subject-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";


export default async function CreateClassroomSubjectPage() {
  const [classroomsData, subjectsData] = await Promise.all([
    listClassrooms(),
    listSubjects(),
  ]);

  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/classroom-subjects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une matière par classe</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle matière pour une classe
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la matière par classe</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomSubjectFormWrapper 
            mode="create"
            classrooms={classrooms}
            subjects={subjects}
          />
        </CardContent>
      </Card>
    </div>
  );
}





