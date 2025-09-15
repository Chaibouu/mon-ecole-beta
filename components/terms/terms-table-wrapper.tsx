"use client";

import { useState } from "react";
import { TermsTable } from "./terms-table";
import { listTerms } from "@/actions/terms";

interface TermsTableWrapperProps {
  initialTerms: any[];
}

export function TermsTableWrapper({ initialTerms }: TermsTableWrapperProps) {
  const [terms, setTerms] = useState(initialTerms);

  const handleRefresh = async () => {
    try {
      const data: any = await listTerms();
      if (data?.terms) {
        setTerms(Array.isArray(data.terms) ? data.terms : []);
      }
    } catch (error) {
      // Error will be handled by error boundary
      console.error("Error refreshing terms:", error);
    }
  };

  return <TermsTable terms={terms} onRefresh={handleRefresh} />;
}







