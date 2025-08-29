import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { TeachersTableWrapper } from "@/components/teachers/teachers-table-wrapper";
import { listTeachers } from "@/actions/school-members";
import Link from "next/link";
import { Plus, GraduationCap, Users, BookOpen, Award } from "lucide-react";

export default async function TeachersPage() {
  const data: any = await listTeachers();
  if (data?.error) {
    throw new Error(data.error);
  }

  const teachers = Array.isArray(data?.teachers) ? data.teachers : [];
  
  // Calculer les statistiques
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((teacher: any) => teacher.user?.status === 'ACTIVE').length;
  const maleTeachers = teachers.filter((teacher: any) => teacher.user?.gender === 'MALE').length;
  const femaleTeachers = teachers.filter((teacher: any) => teacher.user?.gender === 'FEMALE').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Professeurs"
        description="Gérez les professeurs de votre établissement"
        icon={GraduationCap}
        actions={
          <Button asChild>
            <Link href="/teachers/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer un professeur
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des professeurs"
          value={totalTeachers}
          description="Corps enseignant"
          icon={GraduationCap}
          color="blue"
        />
        <StatsCard
          title="Professeurs actifs"
          value={activeTeachers}
          description="En poste actuellement"
          icon={Users}
          color="green"
          trend={{
            value: totalTeachers > 0 ? Math.round((activeTeachers / totalTeachers) * 100) : 0,
            isPositive: true,
            label: "du total"
          }}
        />
        <StatsCard
          title="Professeures"
          value={femaleTeachers}
          description="Personnel féminin"
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Professeurs"
          value={maleTeachers}
          description="Personnel masculin"
          icon={BookOpen}
          color="indigo"
        />
      </div>

      {/* Tableau des professeurs */}
      <EnhancedCard
        title="Liste des professeurs"
        description="Gérez tous vos professeurs et leur profil"
        icon={GraduationCap}
        gradient={true}
      >
        <TeachersTableWrapper initialTeachers={teachers} />
      </EnhancedCard>
    </div>
  );
}
