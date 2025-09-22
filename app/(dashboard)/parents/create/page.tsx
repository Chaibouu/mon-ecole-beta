import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentFormWrapper } from "@/components/parents/parent-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus, Heart } from "lucide-react";
import { listStudents } from "@/actions/school-members";

interface CreateParentPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function CreateParentPage({ searchParams }: CreateParentPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams.returnTo;
  const studentsData: any = await listStudents();
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild className="hover:bg-emerald-50">
          <Link href={returnTo || "/parents"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour {returnTo ? "à l'inscription" : "aux parents"}
          </Link>
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Ajouter un parent
            </h1>
            <p className="text-muted-foreground">
              Créez un nouveau profil de parent d'élève
            </p>
          </div>
        </div>
      </div>

      <Card className="max-w-4xl shadow-xl border-0 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/10">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Informations du parent</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ParentFormWrapper mode="create" students={students} returnTo={returnTo} />
        </CardContent>
      </Card>
    </div>
  );
}

