import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomFormWrapper } from "@/components/classrooms/classroom-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listGradeLevels } from "@/actions/grade-levels";

export default async function CreateClassroomPage() {
  const data: any = await listGradeLevels();
  const gradeLevels = Array.isArray(data?.gradeLevels) ? data.gradeLevels : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/classrooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une classe</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle classe à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de la classe</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomFormWrapper mode="create" gradeLevels={gradeLevels} />
        </CardContent>
      </Card>
    </div>
  );
}

