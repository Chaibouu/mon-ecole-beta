import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ParentsTableWrapper } from "@/components/parents/parents-table-wrapper";
import { listParents } from "@/actions/school-members";
import Link from "next/link";
import { Plus, Users, UserPlus, Phone, Heart } from "lucide-react";

export default async function ParentsPage() {
  const data: any = await listParents();
  if (data?.error) {
    throw new Error(data.error);
  }

  const parents = Array.isArray(data?.parents) ? data.parents : [];
  
  // Calculer les statistiques
  const totalParents = parents.length;
  const activeParents = parents.filter((parent: any) => parent.user?.isActive).length;
  const parentsWithPhone = parents.filter((parent: any) => parent.phone).length;
  const parentsWithAddress = parents.filter((parent: any) => parent.address).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parents"
        description="Gérez les parents d'élèves de votre établissement"
        icon={Heart}
        actions={
          <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
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
          description="Parents enregistrés"
          icon={Heart}
          color="emerald"
          className="border-l-4 border-l-emerald-500"
        />
        <StatsCard
          title="Parents actifs"
          value={activeParents}
          description="Comptes actifs"
          icon={UserPlus}
          color="green"
          className="border-l-4 border-l-green-500"
          trend={{
            value: totalParents > 0 ? Math.round((activeParents / totalParents) * 100) : 0,
            isPositive: true,
            label: "du total"
          }}
        />
        <StatsCard
          title="Avec téléphone"
          value={parentsWithPhone}
          description="Numéro renseigné"
          icon={Phone}
          color="teal"
          className="border-l-4 border-l-teal-500"
        />
        <StatsCard
          title="Avec adresse"
          value={parentsWithAddress}
          description="Adresse renseignée"
          icon={Users}
          color="cyan"
          className="border-l-4 border-l-cyan-500"
        />
      </div>

      {/* Tableau des parents */}
      <EnhancedCard
        title="Liste des parents"
        description="Gérez tous les parents d'élèves et leurs informations"
        icon={Heart}
        gradient={true}
        className="shadow-xl border-0"
      >
        <ParentsTableWrapper initialParents={parents} />
      </EnhancedCard>
    </div>
  );
}
