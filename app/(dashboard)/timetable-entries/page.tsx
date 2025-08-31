import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimetableEntriesTableWrapper } from "@/components/timetable-entries/timetable-entries-table-wrapper";
import { listTimetableEntries } from "@/actions/timetable-entries";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";

export default async function TimetableEntriesPage() {
  const data: any = await listTimetableEntries();
  if (data?.error) {
    throw new Error(data.error);
  }

  const entries = Array.isArray(data?.timetableEntries) ? data.timetableEntries : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emploi du Temps</h1>
          <p className="text-muted-foreground">
            Gérez l'emploi du temps des cours
          </p>
        </div>
        <Button asChild>
          <Link href="/timetable-entries/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une entrée
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Liste des entrées d'emploi du temps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableEntriesTableWrapper initialEntries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}







