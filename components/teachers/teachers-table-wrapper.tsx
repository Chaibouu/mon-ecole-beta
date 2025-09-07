"use client";

import { useState } from "react";
import { listTeachers } from "@/actions/teachers";
import { TeachersTable } from "./teachers-table";

export function TeachersTableWrapper({ initialTeachers, subjects }: { initialTeachers: any[]; subjects: any[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [allSubjects] = useState<any[]>(subjects);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  const handleRefresh = async () => {
    const res: any = await listTeachers();
    if (res?.teachers) setTeachers(Array.isArray(res.teachers) ? res.teachers : []);
  };

  const filtered = selectedSubjectIds.length
    ? teachers.filter((t: any) => Array.isArray(t.subjects) && t.subjects.some((s: any) => selectedSubjectIds.includes(s.id)))
    : teachers;

  return (
    <div className="space-y-4">
      <div>
        {/* react-select filter */}
        {typeof window !== 'undefined' && (
          (() => {
            const ReactSelect = require("react-select").default;
            const options = allSubjects.map((s: any) => ({ value: s.id, label: s.name }));
            const value = options.filter((o: any) => selectedSubjectIds.includes(o.value));
            return (
              <ReactSelect
                isMulti
                options={options}
                value={value}
                onChange={(vals: any) => setSelectedSubjectIds((vals || []).map((v: any) => v.value))}
                placeholder="Filtrer par matière"
              />
            );
          })()
        )}
      </div>
      <TeachersTable teachers={filtered} onRefresh={handleRefresh} />
    </div>
  );
}

