"use client";

import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Users, Building } from "lucide-react";

interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  currentEnrollment?: number;
}

interface ClassSelectProps {
  classes: Class[];
  value?: { value: string; label: string } | null;
  onChange: (option: { value: string; label: string } | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

export function ClassSelect({
  classes,
  value,
  onChange,
  placeholder = "Rechercher une classe...",
  isDisabled = false,
  className,
}: ClassSelectProps) {
  // Créer les options pour le select à partir des props
  const options = classes.map((cls: Class) => ({
    value: cls.id,
    label: `${cls.name} (${cls.level})`,
  }));

  const formatOptionLabel = ({ label, value }: { label: string; value: string }) => {
    const cls = classes.find(c => c.id === value);
    if (!cls) return label;

    const enrollmentPercentage = cls.currentEnrollment 
      ? Math.round((cls.currentEnrollment / cls.capacity) * 100)
      : 0;

    return (
      <div className="flex items-center space-x-3 py-1">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {cls.name}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{cls.level}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{cls.currentEnrollment || 0}/{cls.capacity}</span>
            </span>
            <span>•</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              enrollmentPercentage >= 90 ? 'bg-red-100 text-red-800' :
              enrollmentPercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {enrollmentPercentage}%
            </span>
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
      noOptionsMessage="Aucune classe trouvée"
      formatOptionLabel={formatOptionLabel}
    />
  );
}
