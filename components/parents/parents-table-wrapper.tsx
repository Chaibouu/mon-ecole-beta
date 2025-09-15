"use client";

import { useState } from "react";
import { ParentsTable } from "./parents-table";
import { listParents } from "@/actions/parents";

interface ParentsTableWrapperProps {
  initialParents: any[];
  students: any[];
}

export function ParentsTableWrapper({ initialParents, students }: ParentsTableWrapperProps) {
  const [parents, setParents] = useState(initialParents);

  const handleRefresh = async () => {
    try {
      const data: any = await listParents();
      if (data?.parents) {
        setParents(Array.isArray(data.parents) ? data.parents : []);
      }
    } catch (error) {
      console.error("Error refreshing parents:", error);
    }
  };

  return <ParentsTable parents={parents} students={students} onRefresh={handleRefresh} />;
}

