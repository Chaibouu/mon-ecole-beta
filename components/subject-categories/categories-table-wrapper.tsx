"use client";

import { useState } from "react";
import { listSubjectCategories } from "@/actions/subject-categories";
import { CategoriesTable } from "./categories-table";

export function CategoriesTableWrapper({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);

  const handleRefresh = async () => {
    const res: any = await listSubjectCategories();
    if (res?.subjectCategories) setItems(Array.isArray(res.subjectCategories) ? res.subjectCategories : []);
  };

  return <CategoriesTable items={items} onRefresh={handleRefresh} />;
}















