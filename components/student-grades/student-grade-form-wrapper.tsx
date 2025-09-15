"use client";

import { StudentGradeForm } from "./student-grade-form";
import { useRouter } from "next/navigation";

interface StudentGradeFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  gradeId?: string;
  students: any[];
  assessments: any[];
}

export function StudentGradeFormWrapper({ 
  mode, 
  initialData, 
  gradeId, 
  students, 
  assessments 
}: StudentGradeFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/student-grades");
    } else {
      router.push(`/student-grades/${gradeId}`);
    }
  };

  return (
    <StudentGradeForm
      mode={mode}
      initialData={initialData}
      gradeId={gradeId}
      students={students}
      assessments={assessments}
      onSuccess={handleSuccess}
    />
  );
}





