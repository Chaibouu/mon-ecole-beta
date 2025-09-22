import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeLevelFormWrapper } from "@/components/grade-levels/grade-level-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateGradeLevelPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/grade-levels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer un niveau scolaire</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau niveau scolaire à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du niveau scolaire</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeLevelFormWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}






















