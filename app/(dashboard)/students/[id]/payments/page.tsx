import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard } from "lucide-react";
import { getStudentPayments } from "@/actions/student-payments";
import { StudentPaymentsClient } from "@/components/student-payments/StudentPaymentsClient";

export const metadata: Metadata = {
  title: "Paiements de l'élève",
  description: "Suivi des paiements et frais scolaires de l'élève",
};

export default async function StudentPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch student payment data server-side
  const studentPaymentsData = await getStudentPayments(id);
  
  if (studentPaymentsData?.error) {
    throw new Error(studentPaymentsData.error);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements de l'élève"
        description="Suivi des paiements et frais scolaires"
        icon={CreditCard}
      />

      <StudentPaymentsClient 
        initialData={studentPaymentsData}
        studentId={id} 
      />
    </div>
  );
}
