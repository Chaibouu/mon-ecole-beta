import { listStudentsForTimetableEntry } from "@/actions/timetable-students";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList } from "lucide-react";

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: any = await listStudentsForTimetableEntry(id);
  if (data?.error) throw new Error(data.error);
  const students = Array.isArray(data?.students) ? data.students : [];

  return (
    <div className="space-y-8">
      <PageHeader title="Feuille de présence" description="Marquez l'état des élèves pour ce cours" icon={ClipboardList} />
      <EnhancedCard title="Liste des élèves" description="Sélectionnez un statut et enregistrez" icon={ClipboardList} gradient>
        <AttendanceClient timetableEntryId={id} initialStudents={students} />
      </EnhancedCard>
    </div>
  );
}


