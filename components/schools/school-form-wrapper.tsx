"use client";

import { SchoolForm } from "./school-form";
import { useRouter } from "next/navigation";

interface SchoolFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  schoolId?: string;
}

export function SchoolFormWrapper({ mode, initialData, schoolId }: SchoolFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/dashboard/schools");
    } else {
      router.push(`/dashboard/schools/${schoolId}`);
    }
  };

  return (
    <SchoolForm 
      mode={mode} 
      initialData={initialData}
      schoolId={schoolId}
      onSuccess={handleSuccess} 
    />
  );
}
