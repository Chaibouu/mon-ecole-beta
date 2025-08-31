"use client";

import { StudentForm } from "./student-form";
import { useRouter } from "next/navigation";

interface StudentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  studentId?: string;
}

export function StudentFormWrapper({ mode, initialData, studentId }: StudentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/students");
    } else {
      router.push(`/students/${studentId}`);
    }
  };

  return (
    <StudentForm
      mode={mode}
      initialData={initialData}
      studentId={studentId}
      onSuccess={handleSuccess}
    />
  );
}

