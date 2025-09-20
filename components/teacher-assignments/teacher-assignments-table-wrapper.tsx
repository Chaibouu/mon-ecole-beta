"use client";

import { useState } from "react";
import { TeacherAssignmentsTable } from "./teacher-assignments-table";

interface TeacherAssignmentsTableWrapperProps {
  initialAssignments: any[];
}

export function TeacherAssignmentsTableWrapper({ initialAssignments }: TeacherAssignmentsTableWrapperProps) {
  const [assignments, setAssignments] = useState(initialAssignments);

  const handleDelete = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  return (
    <TeacherAssignmentsTable 
      assignments={assignments} 
      onDelete={handleDelete} 
    />
  );
}




















