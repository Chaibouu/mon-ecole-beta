import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard } from "lucide-react";
import { listPayments, getPaymentAnalytics } from "@/actions/school-fees";
import { listGradeLevels } from "@/actions/grade-levels";
import { listClassrooms } from "@/actions/classrooms";
import PaymentsClient from "@/components/payments/PaymentsClient";

export const metadata: Metadata = {
  title: "Gestion des Paiements",
  description: "Enregistrement et suivi des paiements des frais scolaires",
};

export default async function PaymentsPage() {
  // Fetch initial data
  const [
    paymentsData,
    gradeLevelsData,
    classroomsData,
    analyticsData,
  ] = await Promise.all([
    listPayments(),
    listGradeLevels(),
    listClassrooms(),
    getPaymentAnalytics(),
  ]);
  
  const payments = Array.isArray(paymentsData?.payments) 
    ? paymentsData.payments 
    : [];
  
  const gradeLevels = Array.isArray(gradeLevelsData?.gradeLevels) 
    ? gradeLevelsData.gradeLevels 
    : [];
  
  const classrooms = Array.isArray(classroomsData?.classrooms) 
    ? classroomsData.classrooms 
    : [];

  const analytics = analyticsData?.analytics || {
    totalExpected: 0,
    totalCollected: 0,
    collectionRate: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Paiements"
        description="Enregistrement et suivi des paiements des frais scolaires"
        icon={CreditCard}
      />

      <PaymentsClient
        initialPayments={payments}
        gradeLevels={gradeLevels}
        classrooms={classrooms}
        analytics={analytics}
      />
    </div>
  );
}

