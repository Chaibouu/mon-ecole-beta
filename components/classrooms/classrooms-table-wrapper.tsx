"use client";

import { useState } from "react";
import { ClassroomsTable } from "./classrooms-table";
import { listClassrooms } from "@/actions/classrooms";

interface ClassroomsTableWrapperProps {
  initialClassrooms: any[];
}

export function ClassroomsTableWrapper({ initialClassrooms }: ClassroomsTableWrapperProps) {
  const [classrooms, setClassrooms] = useState(initialClassrooms);

  const handleRefresh = async () => {
    try {
      const data: any = await listClassrooms();
      if (data?.classrooms) {
        setClassrooms(Array.isArray(data.classrooms) ? data.classrooms : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing classrooms:", error);
    }
  };

  return <ClassroomsTable classrooms={classrooms} onRefresh={handleRefresh} />;
}







