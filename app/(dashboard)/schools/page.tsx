import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SchoolsTableWrapper } from "@/components/schools/schools-table-wrapper";
import { listSchools } from "@/actions/schools";
import Link from "next/link";
import { Plus, School, Users, MapPin, TrendingUp } from "lucide-react";

export default async function SchoolsPage() {
  const data: any = await listSchools();
  if (data?.error) {
    // Si c'est une erreur d'autorisation, rediriger vers la page unauthorized
    if (data.error === "Forbidden" || data.error.includes("Forbidden")) {
      throw new Error("Accès interdit. Vous n'avez pas les permissions nécessaires pour accéder à cette page.");
    }
    throw new Error(data.error);
  }

  const schools = Array.isArray(data?.schools) ? data.schools : [];
  
  // Calculer les statistiques
  const totalSchools = schools.length;
  const activeSchools = schools.filter((school: any) => school.status === 'ACTIVE').length;
  const inactiveSchools = schools.filter((school: any) => school.status === 'INACTIVE').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Écoles"
        description="Gérez les établissements scolaires de la plateforme"
        icon={School}
        actions={
          <Button asChild>
            <Link href="/schools/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une école
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des écoles"
          value={totalSchools}
          description="Établissements enregistrés"
          icon={School}
          color="blue"
        />
        <StatsCard
          title="Écoles actives"
          value={activeSchools}
          description="En fonctionnement"
          icon={TrendingUp}
          color="green"
          trend={{
            value: totalSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0,
            isPositive: true,
            label: "du total"
          }}
        />
        <StatsCard
          title="Écoles inactives"
          value={inactiveSchools}
          description="En attente ou fermées"
          icon={MapPin}
          color="yellow"
        />
        <StatsCard
          title="Taux d'activité"
          value={`${totalSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%`}
          description="Écoles opérationnelles"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Tableau des écoles */}
      <EnhancedCard
        title="Liste des écoles"
        description="Gérez tous vos établissements scolaires"
        icon={School}
        gradient={true}
      >
        <SchoolsTableWrapper initialSchools={schools} />
      </EnhancedCard>
    </div>
  );
}
