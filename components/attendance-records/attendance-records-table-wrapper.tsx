"use client";

import { useState } from "react";
import { AttendanceRecordsTable } from "./attendance-records-table";

interface AttendanceRecordsTableWrapperProps {
  initialRecords: any[];
}

export function AttendanceRecordsTableWrapper({ initialRecords }: AttendanceRecordsTableWrapperProps) {
  const [records, setRecords] = useState(initialRecords);

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <AttendanceRecordsTable 
      records={records} 
      onDelete={handleDelete} 
    />
  );
}

















