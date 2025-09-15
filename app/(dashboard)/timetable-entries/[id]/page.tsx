import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, Clock, MapPin, User, BookOpen, GraduationCap } from "lucide-react";
import { getTimetableEntryById } from "@/actions/timetable-entries";
import { notFound } from "next/navigation";

interface TimetableEntryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getDayLabel = (day: string) => {
  const dayMap: Record<string, string> = {
    "MONDAY": "Lundi",
    "TUESDAY": "Mardi",
    "WEDNESDAY": "Mercredi",
    "THURSDAY": "Jeudi",
    "FRIDAY": "Vendredi",
    "SATURDAY": "Samedi",
    "SUNDAY": "Dimanche",
  };
  return dayMap[day] || day;
};

export default async function TimetableEntryDetailPage({ params }: TimetableEntryDetailPageProps) {
  const { id } = await params;
  const data: any = await getTimetableEntryById(id);

  if (data?.error || !data?.timetableEntry) {
    notFound();
  }

  const entry = data.timetableEntry;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/timetable-entries">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cours - {entry.subject?.name}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'entrée d'emploi du temps
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/timetable-entries/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Enseignant:</span>
              <span>
                {entry.teacher?.user?.firstName} {entry.teacher?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{entry.teacher?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière:</span>
              <Badge variant="secondary">{entry.subject?.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe:</span>
              <span>
                {entry.classroom?.name} ({entry.classroom?.gradeLevel?.name})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Jour:</span>
              <Badge variant="outline">{getDayLabel(entry.dayOfWeek)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Horaires:</span>
              <span>{entry.startTime} - {entry.endTime}</span>
            </div>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes et métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{entry.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant ID:</span>
              <span className="font-mono text-sm">{entry.teacherId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière ID:</span>
              <span className="font-mono text-sm">{entry.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{entry.classroomId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





