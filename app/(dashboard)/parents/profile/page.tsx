import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { User, AlertTriangle } from "lucide-react";
import { ParentProfileClient } from "@/components/parents/ParentProfileClient";
import { getParentChildren } from "@/actions/parent-data";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez vos informations personnelles",
};

export default async function ParentProfilePage() {
  // Récupérer les données côté serveur
  const parentData = await getParentChildren();

  if (parentData?.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon profil"
          description="Consultez et modifiez vos informations personnelles"
          icon={User}
        />
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
            <p className="text-red-600">{parentData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Simuler les données du profil parent complet (normalement récupérées d'une autre action)
  const profileData = {
    id: parentData.parentProfile?.id || "",
    phone: parentData.parentProfile?.phone || null,
    address: parentData.parentProfile?.address || null,
    user: {
      id: "parent-user-id",
      name: "Parent Démo", // À récupérer d'une action getUserProfile
      email: "parent@demo.school",
      isActive: true,
    },
    children: parentData.children || [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        description="Consultez et modifiez vos informations personnelles"
        icon={User}
      />

      <ParentProfileClient initialData={profileData} />
    </div>
  );
}
