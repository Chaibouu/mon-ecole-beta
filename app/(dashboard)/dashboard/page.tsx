import { getDashboardStats } from "@/actions/dashboard-stats";
import { getProfile } from "@/actions/getProfile";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PageLoading } from "@/components/ui/loading-spinner";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    // Récupérer les données en parallèle
    const [profileResult, statsResult] = await Promise.all([
      getProfile(),
      getDashboardStats()
    ]);

    // Vérifier les erreurs d'authentification
    if ((profileResult as any).error) {
      redirect("/auth/login");
    }

    const profileData = (profileResult as any).data;
    const user = profileData?.user;
    const selectedSchoolId = profileData?.selectedSchoolId;
    const schools = profileData?.schools || [];

    // Trouver l'école sélectionnée
    const selectedSchool = schools.find((s: any) => s.schoolId === selectedSchoolId) || schools[0] || null;

    return (
      <DashboardContent 
        user={user}
        selectedSchool={selectedSchool}
        stats={statsResult}
      />
    );

  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600">
            Une erreur s'est produite lors du chargement du tableau de bord.
          </p>
        </div>
      </div>
    );
  }
}