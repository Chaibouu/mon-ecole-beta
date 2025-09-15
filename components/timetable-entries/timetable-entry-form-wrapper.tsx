"use client";

import { TimetableEntryForm } from "./timetable-entry-form";
import { useRouter } from "next/navigation";

interface TimetableEntryFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  entryId?: string;
  classrooms: any[];
  subjects: any[];
  teachers: any[];
}

export function TimetableEntryFormWrapper({ 
  mode, 
  initialData, 
  entryId, 
  classrooms,
  subjects,
  teachers,
}: TimetableEntryFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/timetable-entries");
    } else {
      router.push(`/timetable-entries/${entryId}`);
    }
  };

  return (
    <TimetableEntryForm
      mode={mode}
      initialData={initialData}
      entryId={entryId}
      classrooms={classrooms}
      subjects={subjects}
      teachers={teachers}
      onSuccess={handleSuccess}
    />
  );
}





