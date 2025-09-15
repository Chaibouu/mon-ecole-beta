import { Suspense } from "react";
import { StudentDetailView } from "@/components/students/student-detail-view";
import { StudentDetailSkeleton } from "@/components/skeletons/student-detail-skeleton";
import { getStudentDetails } from "@/actions/students";
import { notFound } from "next/navigation";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const resolvedParams = await params;
  
  // Récupérer les données côté serveur
  const result = await getStudentDetails(resolvedParams.id);
  
  if (result.error) {
    notFound();
  }
  
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<StudentDetailSkeleton />}>
        <StudentDetailView 
          studentId={resolvedParams.id} 
          initialData={result.data}
        />
      </Suspense>
    </div>
  );
}
