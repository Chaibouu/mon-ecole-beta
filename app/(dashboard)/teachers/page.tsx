import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { TeachersTableWrapper } from "@/components/teachers/teachers-table-wrapper";
import { listTeachers } from "@/actions/teachers";
import { listSubjects } from "@/actions/subjects";
import { Users2, UserCheck, Plus } from "lucide-react";
import Link from "next/link";

export default async function TeachersPage() {
  const [data, subjectsRes]: any = await Promise.all([
    listTeachers(),
    listSubjects(),
  ]);
  if (data?.error) {
    throw new Error(data.error);
  }
  const teachers = Array.isArray(data?.teachers) ? data.teachers : [];
  const subjects = Array.isArray(subjectsRes?.subjects) ? subjectsRes.subjects : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Professeurs"
        description="Gérez le corps enseignant et leurs matières"
        icon={Users2}
        actions={
          <Button asChild>
            <Link href="/teachers/create">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un professeur
            </Link>
          </Button>
        }
      />

      <EnhancedCard
        title="Liste des professeurs"
        description="Consultez et modifiez les informations des professeurs"
        icon={UserCheck}
        gradient={true}
      >
        <TeachersTableWrapper initialTeachers={teachers} subjects={subjects} />
      </EnhancedCard>
    </div>
  );
}
