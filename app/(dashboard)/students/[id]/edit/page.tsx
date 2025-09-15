import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { getStudentDetails } from "@/actions/students";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";

interface StudentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentEditPage({ params }: StudentEditPageProps) {
  const resolvedParams = await params;
  
  // Récupérer les données côté serveur
  const result = await getStudentDetails(resolvedParams.id);
  
  if (result.error || !result.data?.student) {
    notFound();
  }
  
  const student = result.data.student;
  
  return (
    <div className="space-y-6">
        <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/students/${resolvedParams.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier {student.user?.name || "l'élève"}
          </h1>
          <p className="text-muted-foreground">
            Modifiez les informations de l'élève
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de l'élève
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm 
            mode="edit" 
            initialData={student} 
            studentId={resolvedParams.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}