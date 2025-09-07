import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";
import { ParentDashboardServerComponent } from "@/components/parents/ParentDashboardServerComponent";

export const metadata: Metadata = {
  title: "Espace Parent",
  description: "Vue d'ensemble des informations de vos enfants",
};

export default async function ParentsPage() {


  return (
    <div className="space-y-6">
      <PageHeader
        title="Espace Parent"
        description="Suivez les paiements et informations de vos enfants"
        icon={Users}
      />

      <ParentDashboardServerComponent />
    </div>
  );
}
