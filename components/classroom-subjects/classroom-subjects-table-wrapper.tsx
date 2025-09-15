"use client";

import { useState } from "react";
import { ClassroomSubjectsTable } from "./classroom-subjects-table";

interface ClassroomSubjectsTableWrapperProps {
  initialClassroomSubjects: any[];
}

export function ClassroomSubjectsTableWrapper({ initialClassroomSubjects }: ClassroomSubjectsTableWrapperProps) {
  const [classroomSubjects, setClassroomSubjects] = useState(initialClassroomSubjects);

  const handleDelete = (id: string) => {
    setClassroomSubjects(prev => prev.filter(classroomSubject => classroomSubject.id !== id));
  };

  return (
    <ClassroomSubjectsTable 
      classroomSubjects={classroomSubjects} 
      onDelete={handleDelete} 
    />
  );
}

















