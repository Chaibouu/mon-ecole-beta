"use client";

import { ClassroomForm } from "./classroom-form";
import { useRouter } from "next/navigation";

interface ClassroomFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  classroomId?: string;
  gradeLevels: any[];
}

export function ClassroomFormWrapper({ mode, initialData, classroomId, gradeLevels }: ClassroomFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/classrooms");
    } else {
      router.push(`/classrooms/${classroomId}`);
    }
  };

  return (
    <ClassroomForm
      mode={mode}
      initialData={initialData}
      classroomId={classroomId}
      gradeLevels={gradeLevels}
      onSuccess={handleSuccess}
    />
  );
}





















