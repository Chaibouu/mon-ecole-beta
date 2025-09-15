"use client";

import { useState } from "react";
import { SchoolsTable } from "./schools-table";
import { listSchools } from "@/actions/schools";

interface SchoolsTableWrapperProps {
  initialSchools: any[];
}

export function SchoolsTableWrapper({ initialSchools }: SchoolsTableWrapperProps) {
  const [schools, setSchools] = useState(initialSchools);

  const handleRefresh = async () => {
    try {
      const data: any = await listSchools();
      if (data?.schools) {
        setSchools(Array.isArray(data.schools) ? data.schools : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing schools:", error);
    }
  };

  return <SchoolsTable schools={schools} onRefresh={handleRefresh} />;
}
