"use client";

import { useState, useEffect, useMemo } from "react";
import { TimetableCalendar } from "./TimetableCalendar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTimetableEntries, getWeeklyTimetable } from "@/actions/timetable-entries";
import { listTeacherAssignments } from "@/actions/teacher-assignments";
import { Filter, Users, Calendar } from "lucide-react";

interface TimetableEntriesClientProps {
  academicYearId: string;
  subjects: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string; subjectIds?: string[] }>;
  classrooms: Array<{ id: string; name: string; gradeLevel?: string }>;
}

export function TimetableEntriesClient({
  academicYearId,
  subjects,
  teachers,
  classrooms,
}: TimetableEntriesClientProps) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  const [loading, setLoading] = useState(false);

  // Build day to FC mapping
  const dayToFc: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  // Load teacher assignments for selected classroom
  useEffect(() => {
    if (!selectedClassroom) {
      setTeachersBySubject({});
      return;
    }

    const loadTeacherAssignments = async () => {
      try {
        const taRes: any = await listTeacherAssignments(selectedClassroom);
        const teacherAssignments = Array.isArray(taRes?.teacherAssignments) ? taRes.teacherAssignments : [];
        
        const mapping: Record<string, Array<{ id: string; name: string }>> = {};
        for (const a of teacherAssignments) {
          const sid = a.subjectId;
          const t = a.teacher?.user?.name ? { id: a.teacherId, name: a.teacher.user.name } : null;
          if (!sid || !t) continue;
          if (!mapping[sid]) mapping[sid] = [];
          if (!mapping[sid].some(x => x.id === t.id)) mapping[sid].push(t);
        }
        setTeachersBySubject(mapping);
      } catch (error) {
        console.error("Error loading teacher assignments:", error);
      }
    };

    loadTeacherAssignments();
  }, [selectedClassroom]);

  // Load timetable data for selected classroom
  useEffect(() => {
    if (!selectedClassroom) {
      setEvents([]);
      return;
    }

    const loadTimetable = async () => {
      setLoading(true);
      try {
        const data: any = await getWeeklyTimetable(selectedClassroom);
        if (data?.error) {
          console.error("Error loading timetable:", data.error);
          setEvents([]);
          return;
        }

        const grouped = data?.timetable || {};
        const newEvents = Object.entries(grouped).flatMap(([day, arr]: any) => {
          const dow = dayToFc[day] ?? 1;
          return (arr as any[]).map((e) => {
            const st = new Date(e.startTime);
            const et = new Date(e.endTime);
            const toHHmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            return {
              id: e.id,
              title: `${e.subject?.name || "Matière"}\\n${toHHmm(st)} - ${toHHmm(et)}\\n${e.teacher?.user?.name || "Prof"}`,
              daysOfWeek: [dow],
              startTime: toHHmm(st),
              endTime: toHHmm(et),
              extendedProps: {
                subjectId: e.subjectId,
                teacherId: e.teacherId,
                classroomId: selectedClassroom,
              },
            };
          });
        });
        
        setEvents(newEvents);
      } catch (error) {
        console.error("Error loading timetable:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [selectedClassroom]);

  const classroomOptions = useMemo(() => 
    classrooms.map(c => ({
      value: c.id,
      label: `${c.name}${c.gradeLevel ? ` (${c.gradeLevel})` : ""}`,
    })),
    [classrooms]
  );

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe</label>
              <SearchableSelect
                options={classroomOptions}
                value={selectedClassroom ? classroomOptions.find(c => c.value === selectedClassroom) || null : null}
                onChange={(option) => setSelectedClassroom(option?.value || "")}
                placeholder="Sélectionnez une classe"
                isClearable={true}
                noOptionsMessage="Aucune classe trouvée"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Informations</label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {selectedClassroom ? (
                  <span>{events.length} cours programmés</span>
                ) : (
                  <span>Sélectionnez une classe pour voir les cours</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendrier */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <TimetableCalendar
          events={events}
          subjects={subjects}
          teachers={teachers}
          teachersBySubject={teachersBySubject}
          classroomId={selectedClassroom}
          academicYearId={academicYearId}
          editable={!!selectedClassroom}
        />
      </div>

      {!selectedClassroom && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Sélectionnez une classe</h3>
          <p>Choisissez une classe dans les filtres ci-dessus pour afficher et gérer son emploi du temps.</p>
        </div>
      )}
    </div>
  );
}
