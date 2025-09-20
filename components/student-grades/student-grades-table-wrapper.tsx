"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StudentGradesTable } from "./student-grades-table";
import { listStudentGrades } from "@/actions/student-grades";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";

interface StudentGradesTableWrapperProps {
  initialGrades: any[];
}

export function StudentGradesTableWrapper({ initialGrades }: StudentGradesTableWrapperProps) {
  const [grades, setGrades] = useState(initialGrades);
  const [filters, setFilters] = useState<{ assessmentId?: string; classroomId?: string; subjectId?: string; termId?: string; teacherId?: string }>({});
  const [loading, setLoading] = useState(false);

  // Build options from current grades; fallback to empty arrays if no data yet
  const assessments = useMemo(() => {
    const map = new Map<string, any>();
    grades?.forEach((g: any) => { if (g?.assessment) map.set(g.assessment.id, g.assessment); });
    return Array.from(map.values());
  }, [grades]);

  const assessmentOptions = useMemo(() => assessments.map(a => ({
    value: a.id,
    label: `${a.title} — ${a.subject?.name ?? ""} (${a.classroom?.name ?? ""})`.trim(),
  })), [assessments]);

  const handleFilterChange = useCallback(async (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    setLoading(true);
    try {
      const data = await listStudentGrades(merged);
      const list = Array.isArray((data as any)?.grades) ? (data as any).grades : ((data as any)?.studentGrades || []);
      setGrades(list);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleDelete = (id: string) => {
    setGrades(prev => prev.filter(grade => grade.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3 items-center">
        <SearchableSelect
          options={assessmentOptions}
          value={filters.assessmentId ? assessmentOptions.find(o => o.value === filters.assessmentId) ?? null : null}
          onChange={(opt) => handleFilterChange({ assessmentId: opt?.value || undefined })}
          placeholder="Filtrer par évaluation"
        />
        <SearchableSelect
          options={(() => {
            const subjectMap = new Map<string, any>();
            (grades || []).forEach((g: any) => {
              const subj = g.assessment?.subject;
              if (subj?.id) subjectMap.set(subj.id, subj);
            });
            return Array.from(subjectMap.values()).map((s: any) => ({ value: s.id, label: s.name }));
          })()}
          value={filters.subjectId ? { value: filters.subjectId, label: assessments.find(a => a.subject?.id === filters.subjectId)?.subject?.name || "" } : null}
          onChange={(opt) => handleFilterChange({ subjectId: opt?.value || undefined })}
          placeholder="Filtrer par matière"
        />
        <SearchableSelect
          options={(() => {
            const classroomMap = new Map<string, any>();
            (grades || []).forEach((g: any) => {
              const cls = g.assessment?.classroom;
              if (cls?.id) classroomMap.set(cls.id, cls);
            });
            return Array.from(classroomMap.values()).map((c: any) => ({ value: c.id, label: c.name }));
          })()}
          value={filters.classroomId ? { value: filters.classroomId, label: assessments.find(a => a.classroom?.id === filters.classroomId)?.classroom?.name || "" } : null}
          onChange={(opt) => handleFilterChange({ classroomId: opt?.value || undefined })}
          placeholder="Filtrer par classe"
        />
        <SearchableSelect
          options={(() => {
            const teacherMap = new Map<string, any>();
            (grades || []).forEach((g: any) => {
              const teacher = g.assessment?.createdBy;
              if (teacher?.id) teacherMap.set(teacher.id, teacher);
            });
            return Array.from(teacherMap.values()).map((t: any) => ({ value: t.id, label: t.user?.name || `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim() || t.user?.email }));
          })()}
          value={filters.teacherId ? { value: filters.teacherId, label: (grades.find((g: any) => g.assessment?.createdBy?.id === filters.teacherId)?.assessment?.createdBy?.user?.name) || '' } : null}
          onChange={(opt) => handleFilterChange({ teacherId: opt?.value || undefined })}
          placeholder="Filtrer par enseignant"
        />
      </div>
      <Separator />
      <StudentGradesTable 
        grades={grades} 
        onDelete={handleDelete}
      />
    </div>
  );
}




















