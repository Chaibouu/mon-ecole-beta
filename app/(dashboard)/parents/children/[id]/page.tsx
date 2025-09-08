import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { User, AlertTriangle } from "lucide-react";
// import { ChildDetailClient } from "@/components/parents/ChildDetailClient";
import { getStudentPayments } from "@/actions/student-payments";

export const metadata: Metadata = {
  title: "Détails de l'enfant",
  description: "Informations détaillées et paiements de votre enfant",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Récupérer les données côté serveur
  const studentData = await getStudentPayments(id);

  if (studentData?.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Détails de l'enfant"
          description="Informations complètes et suivi des paiements"
          icon={User}
        />
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
            <p className="text-red-600">{studentData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de l'enfant"
        description="Informations complètes et suivi des paiements"
        icon={User}
      />

      {/* <ChildDetailClient childId={id} initialData={studentData} /> */}
    </div>
  );
}
