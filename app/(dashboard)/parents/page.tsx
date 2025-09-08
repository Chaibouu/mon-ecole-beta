import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ParentsTableWrapper } from "@/components/parents/parents-table-wrapper";
import { listParents } from "@/actions/parents";
import { listStudents } from "@/actions/school-members";
import Link from "next/link";
import { Plus, Users, UserCheck, TrendingUp, Heart } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parents",
  description: "Gérez les parents d'élèves de votre établissement",
};

export default async function ParentsPage() {
  const [parentsData, studentsData]: any = await Promise.all([
    listParents(),
    listStudents(),
  ]);

  if (parentsData?.error) {
    throw new Error(parentsData.error);
  }

  const parents = Array.isArray(parentsData?.parents) ? parentsData.parents : [];
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  
  // Calculer les statistiques
  const totalParents = parents.length;
  const activeParents = parents.filter((parent: any) => parent.user?.isActive).length;
  const parentsWithChildren = parents.filter((parent: any) => 
    parent.children && parent.children.length > 0
  ).length;
  const totalChildren = parents.reduce((acc: number, parent: any) => 
    acc + (parent.children?.length || 0), 0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parents d'élèves"
        description="Gérez les parents d'élèves de votre établissement"
        icon={Users}
        actions={
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/parents/create">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un parent
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des parents"
          value={totalParents}
          description="Parents inscrits"
          icon={Users}
          color="green"
          className="border-l-4 border-l-green-500"
        />
        <StatsCard
          title="Parents actifs"
          value={activeParents}
          description="Actuellement actifs"
          icon={UserCheck}
          color="emerald"
          className="border-l-4 border-l-emerald-500"
          trend={{
            value: totalParents > 0 ? Math.round((activeParents / totalParents) * 100) : 0,
            isPositive: true,
            label: "du total"
          }}
        />
        <StatsCard
          title="Avec enfants"
          value={parentsWithChildren}
          description="Parents avec liaisons"
          icon={Heart}
          color="purple"
          className="border-l-4 border-l-purple-500"
        />
        <StatsCard
          title="Total enfants"
          value={totalChildren}
          description="Liaisons parent-enfant"
          icon={TrendingUp}
          color="purple"
          className="border-l-4 border-l-purple-500"
        />
      </div>

      {/* Tableau des parents */}
      <EnhancedCard
        title="Liste des parents"
        description="Gérez tous les parents d'élèves et leurs informations"
        icon={Users}
        gradient={true}
        className="shadow-xl border-0"
      >
        <ParentsTableWrapper initialParents={parents} students={students} />
      </EnhancedCard>
    </div>
  );
}
