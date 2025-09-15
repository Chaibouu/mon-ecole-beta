"use client";

import { useState } from "react";
import { AcademicYearsTable } from "./academic-years-table";
import { listAcademicYears } from "@/actions/academic-years";

interface AcademicYearsTableWrapperProps {
  initialAcademicYears: any[];
}

export function AcademicYearsTableWrapper({ initialAcademicYears }: AcademicYearsTableWrapperProps) {
  const [academicYears, setAcademicYears] = useState(initialAcademicYears);

  const handleRefresh = async () => {
    try {
      const data: any = await listAcademicYears();
      if (data?.academicYears) {
        setAcademicYears(Array.isArray(data.academicYears) ? data.academicYears : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing academic years:", error);
    }
  };

  return <AcademicYearsTable academicYears={academicYears} onRefresh={handleRefresh} />;
}
