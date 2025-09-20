import { PageHeader } from "@/components/ui/page-header";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { AssessmentTypesManager } from "@/components/assessment-types/AssessmentTypesManager";
import { listAssessmentTypes } from "@/actions/assessment-types";
import { PlusCircle } from "lucide-react";
import { Suspense } from "react";

export default async function AssessmentTypesPage() {
  const data: any = await listAssessmentTypes();
  const types = Array.isArray(data?.types) ? data.types : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Types d'évaluation"
        description="Gérez les catégories d'évaluations et leurs paramètres par défaut"
        icon={PlusCircle}
      />

      <Suspense>
        <AssessmentTypesManager initialTypes={types} />
      </Suspense>
    </div>
  );
}


