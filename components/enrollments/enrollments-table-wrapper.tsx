"use client";

import { useState } from "react";
import { EnrollmentsTable } from "./enrollments-table";

interface EnrollmentsTableWrapperProps {
  initialEnrollments: any[];
}

export function EnrollmentsTableWrapper({ initialEnrollments }: EnrollmentsTableWrapperProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);

  const handleDelete = (id: string) => {
    setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id));
  };

  return (
    <EnrollmentsTable 
      enrollments={enrollments} 
      onDelete={handleDelete} 
    />
  );
}




















