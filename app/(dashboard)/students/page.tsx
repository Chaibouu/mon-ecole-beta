import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { StudentsTableWrapper } from "@/components/students/students-table-wrapper";
import { listStudents } from "@/actions/school-members";
import Link from "next/link";
import { Plus, GraduationCap, Users, UserCheck, TrendingUp } from "lucide-react";

export default async function StudentsPage() {
  const data: any = await listStudents();
  if (data?.error) {
    throw new Error(data.error);
  }

  const students = Array.isArray(data?.students) ? data.students : [];
  
  // Calculer les statistiques
  const totalStudents = students.length;
  const activeStudents = students.filter((student: any) => student.user?.isActive).length;
  const maleStudents = students.filter((student: any) => student.gender === 'MALE').length;
  const femaleStudents = students.filter((student: any) => student.gender === 'FEMALE').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Élèves"
        description="Gérez les élèves de votre établissement"
        icon={GraduationCap}
        actions={
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/students/create">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un élève
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des élèves"
          value={totalStudents}
          description="Élèves inscrits"
          icon={GraduationCap}
          color="blue"
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard
          title="Élèves actifs"
          value={activeStudents}
          description="Actuellement inscrits"
          icon={UserCheck}
          color="green"
          className="border-l-4 border-l-green-500"
          trend={{
            value: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0,
            isPositive: true,
            label: "du total"
          }}
        />
        <StatsCard
          title="Élèves (F)"
          value={femaleStudents}
          description="Population féminine"
          icon={Users}
          color="purple"
          className="border-l-4 border-l-purple-500"
        />
        <StatsCard
          title="Élèves (H)"
          value={maleStudents}
          description="Population masculine"
          icon={TrendingUp}
          color="indigo"
          className="border-l-4 border-l-indigo-500"
        />
      </div>

      {/* Tableau des élèves */}
      <EnhancedCard
        title="Liste des élèves"
        description="Gérez tous vos élèves et leurs informations"
        icon={GraduationCap}
        gradient={true}
        className="shadow-xl border-0"
      >
        <StudentsTableWrapper initialStudents={students} />
      </EnhancedCard>
    </div>
  );
}
