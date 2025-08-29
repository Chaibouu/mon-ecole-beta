import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ClassroomsTableWrapper } from "@/components/classrooms/classrooms-table-wrapper";
import { listClassrooms } from "@/actions/classrooms";
import Link from "next/link";
import { Plus, School, Users, BookOpen, GraduationCap } from "lucide-react";

export default async function ClassroomsPage() {
  const data: any = await listClassrooms();
  if (data?.error) {
    throw new Error(data.error);
  }

  const classrooms = Array.isArray(data?.classrooms) ? data.classrooms : [];
  
  // Calculer les statistiques
  const totalClassrooms = classrooms.length;
  const primaryClassrooms = classrooms.filter((classroom: any) => 
    classroom.gradeLevel?.name?.toLowerCase().includes('primaire')
  ).length;
  const secondaryClassrooms = classrooms.filter((classroom: any) => 
    classroom.gradeLevel?.name?.toLowerCase().includes('secondaire')
  ).length;
  const averageCapacity = classrooms.length > 0 
    ? Math.round(classrooms.reduce((sum: number, classroom: any) => sum + (classroom.capacity || 30), 0) / classrooms.length)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes"
        description="Gérez les classes de votre établissement"
        icon={School}
        actions={
          <Button asChild>
            <Link href="/classrooms/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une classe
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des classes"
          value={totalClassrooms}
          description="Salles de classe"
          icon={School}
          color="blue"
        />
        <StatsCard
          title="Classes primaires"
          value={primaryClassrooms}
          description="Cycle primaire"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Classes secondaires"
          value={secondaryClassrooms}
          description="Cycle secondaire"
          icon={GraduationCap}
          color="purple"
        />
        <StatsCard
          title="Capacité moyenne"
          value={averageCapacity}
          description="Élèves par classe"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Tableau des classes */}
      <EnhancedCard
        title="Liste des classes"
        description="Gérez toutes vos classes et leur configuration"
        icon={School}
        gradient={true}
      >
        <ClassroomsTableWrapper initialClassrooms={classrooms} />
      </EnhancedCard>
    </div>
  );
}
