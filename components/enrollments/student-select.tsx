"use client";

import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { User, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
  matricule?: string;
  gender?: string;
}

interface StudentSelectProps {
  students: Student[];
  value?: { value: string; label: string } | null;
  onChange: (option: { value: string; label: string } | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

export function StudentSelect({
  students,
  value,
  onChange,
  placeholder = "Rechercher un élève...",
  isDisabled = false,
  className,
}: StudentSelectProps) {
  // Créer les options pour le select à partir des props
  const options = students.map((student: Student) => ({
    value: student.id,
    label: `${student.user.name}${student.matricule ? ` (${student.matricule})` : ''}`,
  }));

  const formatOptionLabel = ({ label, value }: { label: string; value: string }) => {
    const student = students.find(s => s.id === value);
    if (!student) return label;

    return (
      <div className="flex items-center space-x-3 py-1">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {student.user.name}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{student.user.email}</span>
            {student.matricule && (
              <>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <GraduationCap className="h-3 w-3" />
                  <span>{student.matricule}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isLoading={false}
      isDisabled={isDisabled}
      className={className}
      noOptionsMessage="Aucun élève trouvé"
      formatOptionLabel={formatOptionLabel}
    />
  );
}
