"use client";

import { useState } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { AssessmentTypesTable } from "./AssessmentTypesTable";
import { AssessmentTypeForm } from "./AssessmentTypeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listAssessmentTypes } from "@/actions/assessment-types";

type Props = {
  initialTypes: any[];
};

export function AssessmentTypesManager({ initialTypes }: Props) {
  const [types, setTypes] = useState<any[]>(initialTypes || []);
  const [editOpen, setEditOpen] = useState(false);
  const [editType, setEditType] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const refresh = async () => {
    const data: any = await listAssessmentTypes();
    setTypes(Array.isArray(data?.types) ? data.types : []);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau type</DialogTitle>
            </DialogHeader>
            <AssessmentTypeForm
              mode="create"
              onSuccess={() => {
                setCreateOpen(false);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EnhancedCard title="Types d'évaluation" description="Gérez les types disponibles">
        <AssessmentTypesTable
          types={types}
          onDelete={() => refresh()}
          onEdit={(t) => {
            setEditType(t);
            setEditOpen(true);
          }}
        />
      </EnhancedCard>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le type</DialogTitle>
          </DialogHeader>
          {editType && (
            <AssessmentTypeForm
              mode="edit"
              initialData={editType}
              typeId={editType.id}
              onSuccess={() => {
                setEditOpen(false);
                setEditType(null);
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


