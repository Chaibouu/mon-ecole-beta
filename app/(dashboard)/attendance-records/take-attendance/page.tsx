import { EnhancedCard } from "@/components/ui/enhanced-card";
import { PageHeader } from "@/components/ui/page-header";
import { UserCheck } from "lucide-react";
import { listClassrooms } from "@/actions/classrooms";
import { getActiveAcademicYear } from "@/actions/academic-years";
import { TakeAttendanceClient } from "@/components/attendance/TakeAttendanceClient";

export default async function TakeAttendancePage() {
  const [classroomsRes, ayRes]: any = await Promise.all([
    listClassrooms(),
    getActiveAcademicYear(),
  ]);

  const classrooms = Array.isArray(classroomsRes?.classrooms) 
    ? classroomsRes.classrooms.map((c: any) => ({ 
        id: c.id, 
        name: c.name, 
        gradeLevel: c.gradeLevel?.name 
      })) 
    : [];
  const academicYearId = ayRes?.academicYear?.id || "";

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Saisie des présences" 
        description="Enregistrer les présences des élèves pour vos cours" 
        icon={UserCheck} 
      />
      
      <EnhancedCard 
        title="Faire l'appel" 
        description="Sélectionnez votre cours et enregistrez les présences" 
        icon={UserCheck} 
        gradient
      >
        <TakeAttendanceClient
          academicYearId={academicYearId}
          classrooms={classrooms}
        />
      </EnhancedCard>
    </div>
  );
}













