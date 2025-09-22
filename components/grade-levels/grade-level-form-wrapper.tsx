"use client";

import { GradeLevelForm } from "./grade-level-form";
import { useRouter } from "next/navigation";

interface GradeLevelFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  gradeLevelId?: string;
}

export function GradeLevelFormWrapper({ mode, initialData, gradeLevelId }: GradeLevelFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/grade-levels");
    } else {
      router.push(`/grade-levels/${gradeLevelId}`);
    }
  };

  return (
    <GradeLevelForm 
      mode={mode} 
      initialData={initialData}
      gradeLevelId={gradeLevelId}
      onSuccess={handleSuccess} 
    />
  );
}






















