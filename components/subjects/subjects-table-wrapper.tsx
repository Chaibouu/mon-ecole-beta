"use client";

import { useState } from "react";
import { SubjectsTable } from "./subjects-table";
import { listSubjects } from "@/actions/subjects";

interface SubjectsTableWrapperProps {
  initialSubjects: any[];
}

export function SubjectsTableWrapper({ initialSubjects }: SubjectsTableWrapperProps) {
  const [subjects, setSubjects] = useState(initialSubjects);

  const handleRefresh = async () => {
    try {
      const data: any = await listSubjects();
      if (data?.subjects) {
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing subjects:", error);
    }
  };

  return <SubjectsTable subjects={subjects} onRefresh={handleRefresh} />;
}





















