"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  data?: any;
}

interface SearchableSelectProps {
  options: Option[];
  value?: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  isClearable?: boolean;
  isMulti?: boolean;
  noOptionsMessage?: string;
  loadingMessage?: string;
  formatOptionLabel?: (option: Option) => React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  isLoading = false,
  isDisabled = false,
  className,
  isClearable = true,
  isMulti = false,
  noOptionsMessage = "Aucune option trouvée",
  loadingMessage = "Chargement...",
  formatOptionLabel,
}: SearchableSelectProps) {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange as any}
      placeholder={placeholder}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isMulti={isMulti}
      noOptionsMessage={() => noOptionsMessage}
      loadingMessage={() => loadingMessage}
      className={cn("min-w-0", className)}
      classNamePrefix="react-select"
      formatOptionLabel={formatOptionLabel}
      styles={{
        control: (provided, state) => ({
          ...provided,
          minHeight: "40px",
          borderColor: state.isFocused ? "rgb(59 130 246)" : "rgb(209 213 219)",
          boxShadow: state.isFocused ? "0 0 0 1px rgb(59 130 246)" : "none",
          "&:hover": {
            borderColor: state.isFocused ? "rgb(59 130 246)" : "rgb(156 163 175)",
          },
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? "rgb(59 130 246)"
            : state.isFocused
            ? "rgb(239 246 255)"
            : "transparent",
          color: state.isSelected ? "white" : "inherit",
          "&:hover": {
            backgroundColor: state.isSelected
              ? "rgb(37 99 235)"
              : "rgb(239 246 255)",
          },
        }),
        menu: (provided) => ({
          ...provided,
          zIndex: 9999,
        }),
      }}
    />
  );
}
