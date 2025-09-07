import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";
import { ParentDashboardClient } from "@/components/parents/ParentDashboardClient";

export const metadata: Metadata = {
  title: "Tableau de bord parent",
  description: "Vue d'ensemble des informations de vos enfants",
};

export default function ParentDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord parent"
        description="Suivez les paiements et informations de vos enfants"
        icon={Users}
      />

      <ParentDashboardClient />
    </div>
  );
}
