"use client";

import { AcademicYearForm } from "./academic-year-form";
import { useRouter } from "next/navigation";

interface AcademicYearFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  academicYearId?: string;
}

export function AcademicYearFormWrapper({ mode, initialData, academicYearId }: AcademicYearFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/dashboard/academic-years");
    } else {
      router.push(`/dashboard/academic-years/${academicYearId}`);
    }
  };

  return (
    <AcademicYearForm 
      mode={mode} 
      initialData={initialData}
      academicYearId={academicYearId}
      onSuccess={handleSuccess} 
    />
  );
}
