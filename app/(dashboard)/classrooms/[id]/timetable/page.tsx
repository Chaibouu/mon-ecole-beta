import { getWeeklyTimetable } from "@/actions/timetable-entries";
import { ClassroomTimetableClient } from "@/components/timetable/ClassroomTimetableClient";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar } from "lucide-react";
import { listSubjects } from "@/actions/subjects";
import { listTeachers } from "@/actions/school-members";
import { listTeacherAssignments } from "@/actions/teacher-assignments";
import { getActiveAcademicYear } from "@/actions/academic-years";

export default async function ClassroomTimetablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, subjectsRes, teachersRes, ayRes, taRes]: any = await Promise.all([
    getWeeklyTimetable(id),
    listSubjects(),
    listTeachers(),
    getActiveAcademicYear(),
    listTeacherAssignments(id),
  ]);
  if (data?.error) throw new Error(data.error);
  const grouped = data?.timetable || {};
  const subjects = Array.isArray(subjectsRes?.subjects) ? subjectsRes.subjects.map((s: any) => ({ id: s.id, name: s.name })) : [];
  const teachers = Array.isArray(teachersRes?.teachers)

    ? teachersRes.teachers.map((t: any) => ({
        id: t.id,
        name: t.user?.name,
        subjectIds: Array.isArray(t.subjects) ? t.subjects.map((s: any) => s.id) : [],
      }))
    : [];
  
  const academicYearId = ayRes?.academicYear?.id || "";
  const teacherAssignments = Array.isArray(taRes?.teacherAssignments) ? taRes.teacherAssignments : [];

  // Build mapping: subjectId -> teachers who teach it in this classroom/year
  const teachersBySubject: Record<string, Array<{ id: string; name: string }>> = {};
  for (const a of teacherAssignments) {
    const sid = a.subjectId;
    const t = a.teacher?.user?.name ? { id: a.teacherId, name: a.teacher.user.name } : null;
    if (!sid || !t) continue;
    if (!teachersBySubject[sid]) teachersBySubject[sid] = [];
    if (!teachersBySubject[sid].some(x => x.id === t.id)) teachersBySubject[sid].push(t);
  }

  // Build recurring events for FullCalendar using daysOfWeek/startTime/endTime
  const dayToFc: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const events = Object.entries(grouped).flatMap(([day, arr]: any) => {
    const dow = dayToFc[day] ?? 1;
    return (arr as any[]).map((e) => {
      const st = new Date(e.startTime);
      const et = new Date(e.endTime);
      const toHHmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return {
        id: e.id,
        title: `${e.subject?.name || "Matière"}\n${toHHmm(st)} - ${toHHmm(et)}\n${e.teacher?.user?.name || "Prof"}`,
        daysOfWeek: [dow],
        startTime: toHHmm(st),
        endTime: toHHmm(et),
        extendedProps: {
          subjectId: e.subjectId,
          teacherId: e.teacherId,
        },
      } as any;
    });
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Emploi du temps" description="Vue hebdomadaire" icon={Calendar} />
      <EnhancedCard title="Semaine" description="Cours de la classe" icon={Calendar} gradient>
        <ClassroomTimetableClient
          classroomId={id}
          academicYearId={academicYearId}
          events={events}
          subjects={subjects}
          teachers={teachers}
          teachersBySubject={teachersBySubject}
        />
      </EnhancedCard>
    </div>
  );
}


