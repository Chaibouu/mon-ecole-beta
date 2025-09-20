"use client";

import { EnrollmentForm } from "./enrollment-form";
import { useRouter } from "next/navigation";

interface EnrollmentFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  enrollmentId?: string;
  students: any[];
  classrooms: any[];
  academicYears: any[];
}

export function EnrollmentFormWrapper({ 
  mode, 
  initialData, 
  enrollmentId, 
  students, 
  classrooms, 
  academicYears 
}: EnrollmentFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/enrollments");
    } else {
      router.push(`/enrollments/${enrollmentId}`);
    }
  };

  return (
    <EnrollmentForm
      mode={mode}
      initialData={initialData}
      enrollmentId={enrollmentId}
      students={students}
      classrooms={classrooms}
      academicYears={academicYears}
      onSuccess={handleSuccess}
    />
  );
}




















