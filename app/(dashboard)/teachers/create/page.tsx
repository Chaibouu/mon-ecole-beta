import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherFormWrapper } from "@/components/teachers/teacher-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateTeacherPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teachers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer un professeur</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau professeur à votre établissement
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du professeur</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherFormWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}







