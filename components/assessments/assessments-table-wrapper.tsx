"use client";

import { useState, useEffect, useCallback } from "react";
import { AssessmentsTable } from "./assessments-table";
import { AssessmentsFilters } from "./assessments-filters";
import { listAssessments } from "@/actions/assessments";

interface AssessmentsTableWrapperProps {
  initialAssessments: any[];
}

export function AssessmentsTableWrapper({ initialAssessments }: AssessmentsTableWrapperProps) {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    classroomId?: string;
    subjectId?: string;
    termId?: string;
    teacherId?: string;
    type?: string;
  }>({});

  const handleDelete = (id: string) => {
    setAssessments(prev => prev.filter(assessment => assessment.id !== id));
  };

  const handleFiltersChange = useCallback(async (newFilters: typeof filters) => {
    setFilters(newFilters);
    setLoading(true);
    
    try {
      const data = await listAssessments(newFilters);
      if (data?.assessments) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error("Erreur lors du filtrage des évaluations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      <AssessmentsFilters 
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />
      <AssessmentsTable 
        assessments={assessments} 
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}




















