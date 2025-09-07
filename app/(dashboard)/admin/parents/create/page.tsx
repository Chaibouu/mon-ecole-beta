import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { UserPlus } from "lucide-react";
import { CreateParentForm } from "@/components/admin/CreateParentForm";

export const metadata: Metadata = {
  title: "Créer un parent",
  description: "Ajouter un nouveau parent et lier ses enfants",
};

export default function CreateParentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un parent"
        description="Ajoutez un nouveau parent et configurez ses liaisons avec les enfants"
        icon={UserPlus}
      />

      <CreateParentForm />
    </div>
  );
}
