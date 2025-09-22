"use client";

import { TeacherAssignmentForm } from "./teacher-assignment-form";
import { useRouter } from "next/navigation";

interface TeacherAssignmentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  assignmentId?: string;
  teachers: any[];
  subjects: any[];
  classrooms: any[];
  academicYears: any[];
}

export function TeacherAssignmentFormWrapper({ 
  mode, 
  initialData, 
  assignmentId, 
  teachers, 
  subjects, 
  classrooms, 
  academicYears 
}: TeacherAssignmentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/teacher-assignments");
    } else {
      router.push(`/teacher-assignments/${assignmentId}`);
    }
  };

  return (
    <TeacherAssignmentForm
      mode={mode}
      initialData={initialData}
      assignmentId={assignmentId}
      teachers={teachers}
      subjects={subjects}
      classrooms={classrooms}
      academicYears={academicYears}
      onSuccess={handleSuccess}
    />
  );
}





















