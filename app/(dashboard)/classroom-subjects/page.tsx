import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomSubjectsTableWrapper } from "@/components/classroom-subjects/classroom-subjects-table-wrapper";
import { listClassroomSubjects } from "@/actions/classroom-subjects";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

export default async function ClassroomSubjectsPage() {
  const data: any = await listClassroomSubjects();
  if (data?.error) {
    throw new Error(data.error);
  }

  const classroomSubjects = Array.isArray(data?.classroomSubjects) ? data.classroomSubjects : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matières par Classe</h1>
          <p className="text-muted-foreground">
            Gérez les matières enseignées dans chaque classe
          </p>
        </div>
        <Button asChild>
          <Link href="/classroom-subjects/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une matière par classe
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Liste des matières par classe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomSubjectsTableWrapper initialClassroomSubjects={classroomSubjects} />
        </CardContent>
      </Card>
    </div>
  );
}













