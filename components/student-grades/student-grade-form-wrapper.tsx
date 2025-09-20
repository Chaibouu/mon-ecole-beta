"use client";

import { StudentGradeForm } from "./student-grade-form";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { bulkUpsertStudentGrades } from "@/actions/student-grades";
import { listStudentsByClassroom } from "@/actions/school-members";
import { listStudentGrades } from "@/actions/student-grades";

interface StudentGradeFormWrapperProps {
  mode: "create" | "edit";
  initialData?: any;
  gradeId?: string;
  students: any[];
  assessments: any[];
  lockedAssessmentId?: string;
}

export function StudentGradeFormWrapper({ 
  mode, 
  initialData, 
  gradeId, 
  students, 
  assessments,
  lockedAssessmentId,
}: StudentGradeFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (mode === "create") {
      router.push("/student-grades");
    } else {
      router.push(`/student-grades/${gradeId}`);
    }
  };

  // Bulk entry state
  const [bulkAssessmentId, setBulkAssessmentId] = useState<string>(lockedAssessmentId || "");
  const [bulkRows, setBulkRows] = useState<Array<{ studentId: string; score: number; name?: string }>>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkLoadingStudents, setBulkLoadingStudents] = useState(false);

  const studentOptions = useMemo(() => students.map((s: any) => ({
    value: s.id,
    label: s.user?.name || `${s.user?.firstName ?? ""} ${s.user?.lastName ?? ""}`.trim() || s.user?.email || "Élève",
    data: s,
  })), [students]);

  const assessmentOptions = useMemo(() => assessments.map((a: any) => ({
    value: a.id,
    label: `${a.title} — ${a.subject?.name ?? ""} (${a.classroom?.name ?? ""})`.trim(),
    data: a,
  })), [assessments]);

  // Auto-load students for selected assessment's classroom
  async function handleBulkAssessmentChange(opt: any) {
    const id = opt?.value || "";
    setBulkAssessmentId(id);
    setBulkRows([]);
    if (!id) return;
    setBulkLoadingStudents(true);
    const assessment = assessments.find((a: any) => a.id === id);
    const classroomId = assessment?.classroomId;
    if (!classroomId) return;
    const res: any = await listStudentsByClassroom(classroomId);
    const fetched = Array.isArray(res?.students) ? res.students : [];
    // Sort alpha by user.name fallback email
    fetched.sort((a: any, b: any) => {
      const an = (a.user?.name || a.user?.email || "").toLowerCase();
      const bn = (b.user?.name || b.user?.email || "").toLowerCase();
      return an.localeCompare(bn);
    });
    // Prefill with existing grades for this assessment
    const existing: any = await listStudentGrades({ assessmentId: id, classroomId });
    const gradeMap = new Map<string, number>();
    if (Array.isArray(existing?.grades)) {
      for (const g of existing.grades) gradeMap.set(g.studentId, g.score);
    }
    const rows = fetched.map((s: any) => ({
      studentId: s.id,
      score: gradeMap.get(s.id) ?? 0,
      name: s.user?.name || s.user?.email || "Élève",
    }));
    setBulkRows(rows);
    setBulkLoadingStudents(false);
  }

  // Auto-load when lockedAssessmentId provided
  useEffect(() => {
    if (lockedAssessmentId) {
      handleBulkAssessmentChange({ value: lockedAssessmentId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedAssessmentId]);

  const handleBulkSave = async () => {
    if (!bulkAssessmentId) {
      toast.error("Veuillez sélectionner une évaluation");
      return;
    }
    const valid = bulkRows.filter(r => r.studentId && r.score >= 0);
    if (!valid.length) {
      toast.error("Aucune note valide à enregistrer");
      return;
    }
    setBulkLoading(true);
    try {
      const res = await bulkUpsertStudentGrades({ assessmentId: bulkAssessmentId, grades: valid });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Notes enregistrées");
        router.push("/student-grades");
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Saisie groupée uniquement */}
      <Card>
        <CardHeader>
          <CardTitle>Saisie groupée des notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {lockedAssessmentId ? (
              <div className="flex items-center text-sm text-muted-foreground">
                {assessmentOptions.find(o => o.value === bulkAssessmentId)?.label || "Évaluation"}
              </div>
            ) : (
              <SearchableSelect
                options={assessmentOptions}
                value={bulkAssessmentId ? assessmentOptions.find(o => o.value === bulkAssessmentId) ?? null : null}
                onChange={handleBulkAssessmentChange as any}
                placeholder={"Sélectionnez l'évaluation"}
              />
            )}
            <div />
          </div>

          {bulkAssessmentId && (
            <div className="space-y-2">
              {bulkLoadingStudents ? (
                <div className="text-sm text-muted-foreground">Chargement des élèves...</div>
              ) : bulkRows.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun élève à afficher pour cette classe.</div>
              ) : (
                bulkRows.map((row, idx) => (
                  <div key={row.studentId} className="grid md:grid-cols-4 gap-3 items-center py-2 border-b last:border-b-0">
                  <div className="md:col-span-3 truncate font-medium">{row.name}</div>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={row.score}
                    onChange={(e) => setBulkRows(prev => prev.map((r, i) => i === idx ? { ...r, score: parseFloat(e.target.value) || 0 } : r))}
                    placeholder="Note"
                  />
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleBulkSave} disabled={bulkLoading}>
              {bulkLoading ? "Enregistrement..." : "Enregistrer toutes les notes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





