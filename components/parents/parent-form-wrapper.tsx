"use client";

import { ParentForm } from "./parent-form";
import { useRouter } from "next/navigation";

interface ParentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
}

export function ParentFormWrapper({ mode, initialData, parentId }: ParentFormWrapperProps) {
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
      onSuccess={handleSuccess}
    />
  );
}

