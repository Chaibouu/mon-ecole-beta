"use client";

import { ParentForm } from "./parent-form";
import { useRouter } from "next/navigation";

interface ParentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
  students?: any[];
  returnTo?: string;
}

export function ParentFormWrapper({ mode, initialData, parentId, students, returnTo }: ParentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push(returnTo || "/parents");
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

