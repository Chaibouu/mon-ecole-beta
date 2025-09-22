import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentFormWrapper } from "@/components/students/student-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

interface CreateStudentPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function CreateStudentPage({ searchParams }: CreateStudentPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams.returnTo;
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50">
          <Link href={returnTo || "/students"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour {returnTo ? "à l'inscription" : "aux élèves"}
          </Link>
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ajouter un élève
            </h1>
            <p className="text-muted-foreground">
              Créez un nouveau profil d'élève pour votre établissement
            </p>
          </div>
        </div>
      </div>

      <Card className="max-w-4xl shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Informations de l'élève</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <StudentFormWrapper mode="create" returnTo={returnTo} />
        </CardContent>
      </Card>
    </div>
  );
}

