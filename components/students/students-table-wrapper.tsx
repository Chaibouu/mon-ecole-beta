"use client";

import { useState } from "react";
import { StudentsTable } from "./students-table";
import { listStudents } from "@/actions/school-members";

interface StudentsTableWrapperProps {
  initialStudents: any[];
}

export function StudentsTableWrapper({ initialStudents }: StudentsTableWrapperProps) {
  const [students, setStudents] = useState(initialStudents);

  const handleRefresh = async () => {
    try {
      const data: any = await listStudents();
      if (data?.students) {
        setStudents(Array.isArray(data.students) ? data.students : []);
      }
    } catch (error) {
      console.error("Error refreshing students:", error);
    }
  };

  return <StudentsTable students={students} onRefresh={handleRefresh} />;
}

