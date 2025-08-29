"use client";

import { ClassroomSubjectForm } from "./classroom-subject-form";
import { useRouter } from "next/navigation";

interface ClassroomSubjectFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  classroomSubjectId?: string;
  classrooms: any[];
  subjects: any[];
}

export function ClassroomSubjectFormWrapper({ 
  mode, 
  initialData, 
  classroomSubjectId, 
  classrooms, 
  subjects 
}: ClassroomSubjectFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/classroom-subjects");
    } else {
      router.push(`/classroom-subjects/${classroomSubjectId}`);
    }
  };

  return (
    <ClassroomSubjectForm
      mode={mode}
      initialData={initialData}
      classroomSubjectId={classroomSubjectId}
      classrooms={classrooms}
      subjects={subjects}
      onSuccess={handleSuccess}
    />
  );
}





