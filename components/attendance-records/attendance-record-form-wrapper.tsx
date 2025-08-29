"use client";

import { AttendanceRecordForm } from "./attendance-record-form";
import { useRouter } from "next/navigation";

interface AttendanceRecordFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  recordId?: string;
  students: any[];
  timetableEntries: any[];
}

export function AttendanceRecordFormWrapper({ 
  mode, 
  initialData, 
  recordId, 
  students, 
  timetableEntries 
}: AttendanceRecordFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/attendance-records");
    } else {
      router.push(`/attendance-records/${recordId}`);
    }
  };

  return (
    <AttendanceRecordForm
      mode={mode}
      initialData={initialData}
      recordId={recordId}
      students={students}
      timetableEntries={timetableEntries}
      onSuccess={handleSuccess}
    />
  );
}





