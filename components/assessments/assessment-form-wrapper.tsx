"use client";

import { AssessmentForm } from "./assessment-form";
import { useRouter } from "next/navigation";

interface AssessmentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  assessmentId?: string;
  classrooms: any[];
  subjects: any[];
  terms: any[];
}

export function AssessmentFormWrapper({ 
  mode, 
  initialData, 
  assessmentId, 
  classrooms, 
  subjects, 
  terms 
}: AssessmentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/assessments");
    } else {
      router.push(`/assessments/${assessmentId}`);
    }
  };

  return (
    <AssessmentForm
      mode={mode}
      initialData={initialData}
      assessmentId={assessmentId}
      classrooms={classrooms}
      subjects={subjects}
      terms={terms}
      onSuccess={handleSuccess}
    />
  );
}





