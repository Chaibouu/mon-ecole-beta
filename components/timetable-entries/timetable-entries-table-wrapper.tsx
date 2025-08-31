"use client";

import { useState } from "react";
import { TimetableEntriesTable } from "./timetable-entries-table";

interface TimetableEntriesTableWrapperProps {
  initialEntries: any[];
}

export function TimetableEntriesTableWrapper({ initialEntries }: TimetableEntriesTableWrapperProps) {
  const [entries, setEntries] = useState(initialEntries);

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <TimetableEntriesTable 
      entries={entries} 
      onDelete={handleDelete} 
    />
  );
}







