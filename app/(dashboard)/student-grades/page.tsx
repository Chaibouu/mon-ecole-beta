import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { StudentGradesTableWrapper } from "@/components/student-grades/student-grades-table-wrapper";
import { listStudentGrades } from "@/actions/student-grades";
import Link from "next/link";
import { Plus, GraduationCap, TrendingUp, Award, BarChart3 } from "lucide-react";

export default async function StudentGradesPage() {
  const data: any = await listStudentGrades();
  if (data?.error) {
    throw new Error(data.error);
  }

  const grades = Array.isArray(data?.studentGrades) ? data.studentGrades : [];
  
  // Calculer les statistiques
  const totalGrades = grades.length;
  const averageScore = grades.length > 0 
    ? Math.round((grades.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / grades.length) * 10) / 10
    : 0;
  const excellentGrades = grades.filter((grade: any) => {
    const percentage = (grade.score / (grade.assessment?.maxScore || 20)) * 100;
    return percentage >= 80;
  }).length;
  const passedGrades = grades.filter((grade: any) => {
    const percentage = (grade.score / (grade.assessment?.maxScore || 20)) * 100;
    return percentage >= 50;
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notes des élèves"
        description="Gérez les notes et résultats des élèves"
        icon={GraduationCap}
        actions={
          <Button asChild>
            <Link href="/student-grades/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une note
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des notes"
          value={totalGrades}
          description="Notes enregistrées"
          icon={GraduationCap}
          color="blue"
        />
        <StatsCard
          title="Moyenne générale"
          value={`${averageScore}/20`}
          description="Toutes matières confondues"
          icon={BarChart3}
          color="green"
          trend={{
            value: (averageScore / 20) * 100,
            isPositive: averageScore >= 10,
            label: "de réussite"
          }}
        />
        <StatsCard
          title="Notes excellentes"
          value={excellentGrades}
          description="≥ 80% (16/20 et plus)"
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Taux de réussite"
          value={`${totalGrades > 0 ? Math.round((passedGrades / totalGrades) * 100) : 0}%`}
          description="Notes ≥ 10/20"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Tableau des notes */}
      <EnhancedCard
        title="Liste des notes"
        description="Consultez et gérez toutes les notes des élèves"
        icon={GraduationCap}
        gradient={true}
      >
        <StudentGradesTableWrapper initialGrades={grades} />
      </EnhancedCard>
    </div>
  );
}
