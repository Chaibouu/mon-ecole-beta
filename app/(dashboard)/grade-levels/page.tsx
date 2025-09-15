import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeLevelsTableWrapper } from "@/components/grade-levels/grade-levels-table-wrapper";
import { listGradeLevels } from "@/actions/grade-levels";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function GradeLevelsPage() {
  const data: any = await listGradeLevels();
  if (data?.error) {
    throw new Error(data.error);
  }

  const gradeLevels = Array.isArray(data?.gradeLevels) ? data.gradeLevels : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Niveaux Scolaires</h1>
          <p className="text-muted-foreground">
            Gérez les niveaux scolaires de votre établissement
          </p>
        </div>
        <Button asChild>
          <Link href="/grade-levels/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer un niveau
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des niveaux scolaires</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeLevelsTableWrapper initialGradeLevels={gradeLevels} />
        </CardContent>
      </Card>
    </div>
  );
}
