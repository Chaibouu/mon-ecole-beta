"use client";

import { useState } from "react";
import { AssessmentsTable } from "./assessments-table";

interface AssessmentsTableWrapperProps {
  initialAssessments: any[];
}

export function AssessmentsTableWrapper({ initialAssessments }: AssessmentsTableWrapperProps) {
  const [assessments, setAssessments] = useState(initialAssessments);

  const handleDelete = (id: string) => {
    setAssessments(prev => prev.filter(assessment => assessment.id !== id));
  };

  return (
    <AssessmentsTable 
      assessments={assessments} 
      onDelete={handleDelete} 
    />
  );
}

















