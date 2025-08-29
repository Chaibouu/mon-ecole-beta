"use client";

import { TermForm } from "./term-form";
import { useRouter } from "next/navigation";

interface TermFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  termId?: string;
  academicYears: any[];
}

export function TermFormWrapper({ mode, initialData, termId, academicYears }: TermFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/terms");
    } else {
      router.push(`/terms/${termId}`);
    }
  };

    return (
    <TermForm
      mode={mode}
      initialData={initialData}
      termId={termId}
      academicYears={academicYears}
      onSuccess={handleSuccess}
    />
  );
}
