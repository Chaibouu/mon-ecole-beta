import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentsTableWrapper } from "@/components/enrollments/enrollments-table-wrapper";
import { listEnrollments } from "@/actions/enrollments";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";

export default async function EnrollmentsPage() {
  const data: any = await listEnrollments();
  if (data?.error) {
    throw new Error(data.error);
  }

  const enrollments = Array.isArray(data?.enrollments) ? data.enrollments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions Élèves</h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions des élèves dans les classes
          </p>
        </div>
        <Button asChild>
          <Link href="/enrollments/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une inscription
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Liste des inscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentsTableWrapper initialEnrollments={enrollments} />
        </CardContent>
      </Card>
    </div>
  );
}





















