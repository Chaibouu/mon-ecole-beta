"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGradeLevelSubject, updateGradeLevelSubject } from "@/actions/grade-level-subjects";
import { toast } from "sonner";

export function GradeLevelSubjectsTable({ gradeLevels, subjects, items }: any) {
  const router = useRouter();
  const [levelId, setLevelId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [coefficient, setCoefficient] = useState<string>("1");
  const [isSaving, setIsSaving] = useState(false);

  const itemsByLevel = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const gl of gradeLevels) map[gl.id] = [];
    for (const item of items) {
      if (!map[item.gradeLevelId]) map[item.gradeLevelId] = [];
      map[item.gradeLevelId].push(item);
    }
    return map;
  }, [items, gradeLevels]);

  async function handleCreate() {
    if (!levelId || !subjectId) {
      toast.error("Sélectionnez un niveau et une matière");
      return;
    }
    setIsSaving(true);
    try {
      const res: any = await createGradeLevelSubject({ gradeLevelId: levelId, subjectId, coefficient: Number(coefficient) });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Coefficient créé");
        setSubjectId("");
        setCoefficient("1");
        router.refresh();
      }
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Select value={levelId} onValueChange={setLevelId}>
          <SelectTrigger>
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            {gradeLevels.map((gl: any) => (
              <SelectItem key={gl.id} value={gl.id}>{gl.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="number" step="0.5" value={coefficient} onChange={e => setCoefficient(e.target.value)} placeholder="Coeff" />
          <Button onClick={handleCreate} disabled={isSaving}>Ajouter</Button>
        </div>
      </div>

      <div className="space-y-4">
        {gradeLevels.map((gl: any) => (
          <div key={gl.id} className="border rounded-lg p-4">
            <div className="font-semibold mb-3">{gl.name}</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(itemsByLevel[gl.id] || []).map((it: any) => (
                <div key={it.id} className="flex items-center justify-between border rounded-md p-2">
                  <span>{it.subject?.name || "Matière"}</span>
                  <InlineEditCoefficient item={it} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InlineEditCoefficient({ item }: any) {
  const router = useRouter();
  const [value, setValue] = useState<string>(String(item.coefficient ?? 1));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res: any = await updateGradeLevelSubject(item.id, { coefficient: Number(value) });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Mis à jour");
        router.refresh();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="number" step="0.5" value={value} onChange={e => setValue(e.target.value)} className="w-24" />
      <Button variant="outline" size="sm" onClick={save} disabled={saving}>Enregistrer</Button>
    </div>
  );
}
