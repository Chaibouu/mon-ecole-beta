import { getDashboardStats } from "@/actions/dashboard-stats";
import { getUserProfile } from "@/actions/getUserProfile";
import { listClassrooms } from "@/actions/classrooms";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PageLoading } from "@/components/ui/loading-spinner";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    // Récupérer les données en parallèle
    const [profile, statsResult, classroomsResult] = await Promise.all([
      getUserProfile(),
      getDashboardStats(),
      listClassrooms(),
    ]);

    // Vérifier les erreurs d'authentification
    if ((profile as any)?.error) {
      redirect("/auth/login");
    }

    const user = (profile as any)?.user;
    const selectedSchoolId = (profile as any)?.selectedSchoolId;
    const schools = (profile as any)?.schools || [];

    // Récupérer les classes
    const classrooms = (classroomsResult as any)?.error ? [] : (Array.isArray((classroomsResult as any)?.classrooms) ? (classroomsResult as any).classrooms : []);

    // Trouver l'école sélectionnée
    const selectedSchool = schools.find((s: any) => s.schoolId === selectedSchoolId) || schools[0] || null;

    return (
      <DashboardContent 
        user={user}
        selectedSchool={selectedSchool}
        stats={statsResult}
        classrooms={classrooms}
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