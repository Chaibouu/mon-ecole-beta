import { EnhancedCard } from "@/components/ui/enhanced-card";
import { PageHeader } from "@/components/ui/page-header";
import { UserCheck } from "lucide-react";
import { listClassrooms } from "@/actions/classrooms";
import { listSubjects } from "@/actions/subjects";
import { getActiveAcademicYear } from "@/actions/academic-years";
import { AttendanceAnalyticsClient } from "@/components/attendance/AttendanceAnalyticsClient";

export default async function AttendanceRecordsPage() {
  const [classroomsRes, subjectsRes, ayRes]: any = await Promise.all([
    listClassrooms(),
    listSubjects(),
    getActiveAcademicYear(),
  ]);

  const classrooms = Array.isArray(classroomsRes?.classrooms) 
    ? classroomsRes.classrooms.map((c: any) => ({ 
        id: c.id, 
        name: c.name, 
        gradeLevel: c.gradeLevel?.name 
      })) 
    : [];
  const subjects = Array.isArray(subjectsRes?.subjects) 
    ? subjectsRes.subjects.map((s: any) => ({ 
        id: s.id, 
        name: s.name 
      })) 
    : [];
  const academicYearId = ayRes?.academicYear?.id || "";

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Présences et absences" 
        description="Analyse des données de présence et d'assiduité" 
        icon={UserCheck} 
      />
      
      <EnhancedCard 
        title="Tableau de bord" 
        description="Statistiques et analyses des présences" 
        icon={UserCheck} 
        gradient
      >
        <AttendanceAnalyticsClient
          academicYearId={academicYearId}
          classrooms={classrooms}
          subjects={subjects}
        />
      </EnhancedCard>
    </div>
  );
}







