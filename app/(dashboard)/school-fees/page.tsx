import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SchoolFeesClient from "@/components/school-fees/SchoolFeesClient";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard } from "lucide-react";
import { listFeeSchedules, getPaymentAnalytics } from "@/actions/school-fees";
import { listGradeLevels } from "@/actions/grade-levels";
import { listClassrooms } from "@/actions/classrooms";

export default async function SchoolFeesPage() {
  // Fetch initial data
  const [
    feeSchedulesData,
    gradeLevelsData,
    classroomsData,
    analyticsData,
  ] = await Promise.all([
    listFeeSchedules(),
    listGradeLevels(),
    listClassrooms(),
    getPaymentAnalytics(),
  ]);

  const feeSchedules = Array.isArray(feeSchedulesData?.feeSchedules) 
    ? feeSchedulesData.feeSchedules 
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
    <div className="space-y-8">
      <PageHeader 
        title="Frais scolaires" 
        description="Gestion des frais de scolarité et paiements" 
        icon={CreditCard} 
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total attendu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.totalExpected / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total collecté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(analytics.totalCollected / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de collecte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.collectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(analytics.pendingAmount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(analytics.overdueAmount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des frais scolaires</CardTitle>
        </CardHeader>
        <CardContent>
                <SchoolFeesClient
        initialFeeSchedules={feeSchedules}
        gradeLevels={gradeLevels}
        classrooms={classrooms}
        analytics={analytics}
      />
        </CardContent>
      </Card>
    </div>
  );
}
