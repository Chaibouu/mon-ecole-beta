import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveSchool } from "@/actions/schools";
import { SchoolFormWrapper } from "@/components/schools/school-form-wrapper";

export default async function MySchoolPage() {
  const result: any = await getActiveSchool();
  if (result?.error || !result?.school) {
    throw new Error(result?.error || "École introuvable");
  }
  const school = result.school;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon école</h1>
          <p className="text-muted-foreground">Gérez les informations de votre établissement</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'école</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolFormWrapper 
            mode="edit" 
            initialData={school} 
            schoolId={school.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}


