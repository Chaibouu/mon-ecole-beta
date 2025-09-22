import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherFormWrapper } from "@/components/teachers/teacher-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeacherById } from "@/actions/teachers";
import { listSubjects } from "@/actions/subjects";
import { notFound } from "next/navigation";

interface EditTeacherPageProps {
  params:Promise<{
    id: string;
  }>;
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { id } = await params;
  const [data, subjectsRes]: any = await Promise.all([
    getTeacherById(id),
    listSubjects(),
  ]);

  if (data?.error || !data?.teacher) {
    notFound();
  }

  const teacher = data.teacher;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/teachers/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'enseignant</h1>
          <p className="text-muted-foreground">
            Modifiez les informations de l'enseignant "{teacher.user?.name || 'Enseignant'}"
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'enseignant</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherFormWrapper
            mode="edit"
            initialData={{
              firstName: teacher.user?.name?.split(' ')[0] || '',
              lastName: teacher.user?.name?.split(' ').slice(1).join(' ') || '',
              email: teacher.user?.email || '',
              phone: teacher.user?.phone || '',
              // Champs du profil enseignant
              bio: teacher.bio || '',
              employeeNumber: teacher.employeeNumber || '',
              gender: teacher.gender || '',
              dateOfBirth: teacher.dateOfBirth || '',
              placeOfBirth: teacher.placeOfBirth || '',
              nationality: teacher.nationality || '',
              bloodType: teacher.bloodType || '',
              address: teacher.address || '',
              emergencyContact: teacher.emergencyContact || '',
              emergencyPhone: teacher.emergencyPhone || '',
              hireDate: teacher.hireDate || '',
              qualification: teacher.qualification || '',
              specialization: teacher.specialization || '',
              experienceYears: teacher.experienceYears?.toString() || '',
              salary: teacher.salary ? (teacher.salary / 100).toString() : '',
              status: teacher.status || 'ACTIVE',
              subjectIds: Array.isArray(teacher.subjects) ? teacher.subjects.map((s: any) => s.id) : [],
              __subjects: Array.isArray(subjectsRes?.subjects) ? subjectsRes.subjects : [],
            }}
            teacherId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

