"use client";

import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string;
  };
  bio?: string;
}

interface TeacherSelectProps {
  teachers: Teacher[];
  value: string | undefined;
  onChange: (option: { value: string; label: string } | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

export function TeacherSelect({ 
  teachers, 
  value, 
  onChange, 
  placeholder = "Rechercher un enseignant...",
  isDisabled = false 
}: TeacherSelectProps) {
  const options = [
    { value: "none", label: "Aucun enseignant principal" },
    ...teachers.map((teacher: Teacher) => ({
      value: teacher.id,
      label: teacher.user.name || "Nom non renseigné",
    })),
  ];

  const selectedOption = options.find(option => option.value === value) || null;

  const formatOptionLabel = (option: { value: string; label: string }) => {
    if (option.value === "none") {
      return <span className="text-muted-foreground">{option.label}</span>;
    }
    
    const teacher = teachers.find(t => t.id === option.value);
    return (
      <div className="flex flex-col">
        <span className="font-medium">{option.label}</span>
        {teacher?.user.email && (
          <span className="text-sm text-muted-foreground">{teacher.user.email}</span>
        )}
      </div>
    );
  };

  return (
    <SearchableSelect
      options={options}
      value={selectedOption}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={false}
      formatOptionLabel={formatOptionLabel}
    />
  );
}
