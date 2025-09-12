"use client";

import { useState } from "react";
import { StudentGradesTable } from "./student-grades-table";

interface StudentGradesTableWrapperProps {
  initialGrades: any[];
}

export function StudentGradesTableWrapper({ initialGrades }: StudentGradesTableWrapperProps) {
  const [grades, setGrades] = useState(initialGrades);

  const handleDelete = (id: string) => {
    setGrades(prev => prev.filter(grade => grade.id !== id));
  };

  return (
    <StudentGradesTable 
      grades={grades} 
      onDelete={handleDelete} 
    />
  );
}

















