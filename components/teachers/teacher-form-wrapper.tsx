"use client";

import { TeacherForm } from "./teacher-form";
import { useRouter } from "next/navigation";

interface TeacherFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  teacherId?: string;
}

export function TeacherFormWrapper({ mode, initialData, teacherId }: TeacherFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/teachers");
    } else {
      router.push(`/teachers/${teacherId}`);
    }
  };

  return (
    <TeacherForm
      mode={mode}
      initialData={initialData}
      teacherId={teacherId}
      onSuccess={handleSuccess}
    />
  );
}







