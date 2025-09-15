import { TimetableCalendar } from "@/components/timetable/TimetableCalendar";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar } from "lucide-react";
import { listSubjects } from "@/actions/subjects";
import { listTeachers } from "@/actions/school-members";
import { listClassrooms } from "@/actions/classrooms";
import { listTeacherAssignments } from "@/actions/teacher-assignments";
import { getActiveAcademicYear } from "@/actions/academic-years";
import { TimetableEntriesClient } from "@/components/timetable/TimetableEntriesClient";

export default async function TimetableEntriesPage() {
  const [subjectsRes, teachersRes, classroomsRes, ayRes]: any = await Promise.all([
    listSubjects(),
    listTeachers(),
    listClassrooms(),
    getActiveAcademicYear(),
  ]);

  const subjects = Array.isArray(subjectsRes?.subjects) ? subjectsRes.subjects.map((s: any) => ({ id: s.id, name: s.name })) : [];
  const teachers = Array.isArray(teachersRes?.teachers)
    ? teachersRes.teachers.map((t: any) => ({
        id: t.id,
        name: t.user?.name,
        subjectIds: Array.isArray(t.subjects) ? t.subjects.map((s: any) => s.id) : [],
      }))
    : [];
  const classrooms = Array.isArray(classroomsRes?.classrooms) ? classroomsRes.classrooms.map((c: any) => ({ id: c.id, name: c.name, gradeLevel: c.gradeLevel?.name })) : [];
  const academicYearId = ayRes?.academicYear?.id || "";

  return (
    <div className="space-y-8">
      <PageHeader title="Emploi du temps général" description="Gérez tous les emplois du temps des classes" icon={Calendar} />
      
      <EnhancedCard title="Calendrier" description="Vue d'ensemble des emplois du temps" icon={Calendar} gradient>
        <TimetableEntriesClient
          academicYearId={academicYearId}
          subjects={subjects}
          teachers={teachers}
          classrooms={classrooms}
        />
      </EnhancedCard>
    </div>
  );
}








