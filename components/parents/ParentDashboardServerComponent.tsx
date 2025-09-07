import { getParentPaymentsSummary } from "@/actions/parent-data";
import { ParentDashboardClient } from "./ParentDashboardClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export async function ParentDashboardServerComponent() {
  const data = await getParentPaymentsSummary();

  if (data?.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
    );
  }

  return <ParentDashboardClient initialData={data} />;
}
