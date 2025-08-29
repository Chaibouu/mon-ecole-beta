import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimetableEntryFormWrapper } from "@/components/timetable-entries/timetable-entry-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";
import { listTeachers } from "@/actions/school-members";

export default async function CreateTimetableEntryPage() {
  const [classroomsData, subjectsData, teachersData] = await Promise.all([
    listClassrooms(),
    listSubjects(),
    listTeachers(),
  ]);
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];
  const teachers = Array.isArray(teachersData?.teachers) ? teachersData.teachers : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/timetable-entries">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une entrée d'emploi du temps</h1>
          <p className="text-muted-foreground">
            Ajoutez un cours à l'emploi du temps
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'entrée d'emploi du temps</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableEntryFormWrapper 
            mode="create"
            classrooms={classrooms}
            subjects={subjects}
            teachers={teachers}
          />
        </CardContent>
      </Card>
    </div>
  );
}





