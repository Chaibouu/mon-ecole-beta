"use client";

import { SubjectForm } from "./subject-form";
import { useRouter } from "next/navigation";

interface SubjectFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  subjectId?: string;
  categories?: any[];
}

export function SubjectFormWrapper({ mode, initialData, subjectId, categories }: SubjectFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/subjects");
    } else {
      router.push(`/subjects/${subjectId}`);
    }
  };

  return (
    <SubjectForm
      mode={mode}
      initialData={initialData}
      subjectId={subjectId}
      onSuccess={handleSuccess}
      categories={categories}
    />
  );
}








