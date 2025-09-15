import { TimetableCalendar } from "./TimetableCalendar";

type EventItem = {
  id?: string;
  title: string;
  start?: string | Date;
  end?: string | Date;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  extendedProps?: Record<string, any>;
};

export function ClassroomTimetableClient({
  classroomId,
  academicYearId,
  events,
  subjects,
  teachers,
  teachersBySubject,
}: {
  classroomId: string;
  academicYearId: string;
  events: EventItem[];
  subjects: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string; subjectIds?: string[] }>;
  teachersBySubject?: Record<string, Array<{ id: string; name: string }>>;
}) {
  return (
    <TimetableCalendar
      events={events}
      subjects={subjects}
      teachers={teachers}
      teachersBySubject={teachersBySubject}
      classroomId={classroomId}
      academicYearId={academicYearId}
      editable={true}
    />
  );
}


