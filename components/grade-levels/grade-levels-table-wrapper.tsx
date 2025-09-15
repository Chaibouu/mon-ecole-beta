"use client";

import { useState } from "react";
import { GradeLevelsTable } from "./grade-levels-table";
import { listGradeLevels } from "@/actions/grade-levels";

interface GradeLevelsTableWrapperProps {
  initialGradeLevels: any[];
}

export function GradeLevelsTableWrapper({ initialGradeLevels }: GradeLevelsTableWrapperProps) {
  const [gradeLevels, setGradeLevels] = useState(initialGradeLevels);

  const handleRefresh = async () => {
    try {
      const data: any = await listGradeLevels();
      if (data?.gradeLevels) {
        setGradeLevels(Array.isArray(data.gradeLevels) ? data.gradeLevels : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing grade levels:", error);
    }
  };

  return <GradeLevelsTable gradeLevels={gradeLevels} onRefresh={handleRefresh} />;
}







