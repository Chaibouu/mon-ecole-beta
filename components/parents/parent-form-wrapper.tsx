"use client";

import { ParentForm } from "./parent-form";
import { useRouter } from "next/navigation";

interface ParentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
  students?: any[];
}

export function ParentFormWrapper({ mode, initialData, parentId, students }: ParentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/parents");
    } else {
      router.push(`/parents/${parentId}`);
    }
  };

  return (
    <ParentForm
      mode={mode}
      initialData={initialData}
      parentId={parentId}
      students={students}
      onSuccess={handleSuccess}
    />
  );
}

