import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimetableEntryFormWrapper } from "@/components/timetable-entries/timetable-entry-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTimetableEntryById } from "@/actions/timetable-entries";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";
import { listTeachers } from "@/actions/school-members";
import { notFound } from "next/navigation";

interface EditTimetableEntryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTimetableEntryPage({ params }: EditTimetableEntryPageProps) {
  const { id } = await params;
  
  const [entryData, classroomsData, subjectsData, teachersData] = await Promise.all([
    getTimetableEntryById(id),
    listClassrooms(),
    listSubjects(),
    listTeachers(),
  ]);

  if (entryData?.error || !entryData?.timetableEntry) {
    notFound();
  }

  const entry = entryData.timetableEntry;
  const classrooms = Array.isArray(classroomsData?.classrooms) ? classroomsData.classrooms : [];
  const subjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : [];
  const teachers = Array.isArray(teachersData?.teachers) ? teachersData.teachers : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/timetable-entries/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'entrée d'emploi du temps</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de l'entrée d'emploi du temps
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'entrée d'emploi du temps</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableEntryFormWrapper 
            mode="edit"
            initialData={entry}
            entryId={id}
            classrooms={classrooms}
            subjects={subjects}
            teachers={teachers}
          />
        </CardContent>
      </Card>
    </div>
  );
}





