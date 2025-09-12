"use client";

import { SubjectCategoryForm } from "./subject-category-form";
import { useRouter } from "next/navigation";

type WrapperProps = {
  mode: "create" | "edit";
  initialData?: any;
  categoryId?: string;
};

export function SubjectCategoryFormWrapper({ mode, initialData, categoryId }: WrapperProps) {
  const router = useRouter();
  const onSuccess = () => {
    if (mode === "create") router.push("/subject-categories");
    else router.push(`/subject-categories/${categoryId}`);
  };
  return (
    <SubjectCategoryForm mode={mode} initialData={initialData} categoryId={categoryId} onSuccess={onSuccess} />
  );
}












