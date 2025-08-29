"use client";

import { useState } from "react";
import { TeachersTable } from "./teachers-table";
import { listTeachers } from "@/actions/school-members";

interface TeachersTableWrapperProps {
  initialTeachers: any[];
}

export function TeachersTableWrapper({ initialTeachers }: TeachersTableWrapperProps) {
  const [teachers, setTeachers] = useState(initialTeachers);

  const handleRefresh = async () => {
    try {
      const data: any = await listTeachers();
      if (data?.teachers) {
        setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing teachers:", error);
    }
  };

  return <TeachersTable teachers={teachers} onRefresh={handleRefresh} />;
}

