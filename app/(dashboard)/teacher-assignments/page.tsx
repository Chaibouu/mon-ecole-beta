import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherAssignmentsTableWrapper } from "@/components/teacher-assignments/teacher-assignments-table-wrapper";
import { listTeacherAssignments } from "@/actions/teacher-assignments";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

export default async function TeacherAssignmentsPage() {
  const data: any = await listTeacherAssignments();
  if (data?.error) {
    throw new Error(data.error);
  }

  const assignments = Array.isArray(data?.teacherAssignments) ? data.teacherAssignments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affectations Enseignants</h1>
          <p className="text-muted-foreground">
            Gérez les affectations des enseignants aux matières et classes
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher-assignments/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une affectation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des affectations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherAssignmentsTableWrapper initialAssignments={assignments} />
        </CardContent>
      </Card>
    </div>
  );
}
