"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAttendance } from "@/actions/attendance-records";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXPELLED" | "SICK" | "LATE";

export function AttendanceClient({
  timetableEntryId,
  initialStudents,
}: {
  timetableEntryId: string;
  initialStudents: Array<{ id: string; user?: { name?: string } }>;
}) {
  const [rows, setRows] = useState(
    initialStudents.map(s => ({
      studentId: s.id,
      name: s.user?.name,
      status: "PRESENT" as AttendanceStatus,
    }))
  );
  const [loading, setLoading] = useState(false);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setRows(prev => prev.map(r => (r.studentId === studentId ? { ...r, status } : r)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const r of rows) {
        await createAttendance({
          studentId: r.studentId,
          date: new Date().toISOString().slice(0, 10),
          status: r.status,
          timetableEntryId,
        } as any);
      }
      toast.success("Présence enregistrée");
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.studentId} className="flex items-center justify-between rounded-md border p-3">
            <div className="font-medium text-sm">{r.name}</div>
            <div className="w-56">
              <Select value={r.status} onValueChange={(v) => updateStatus(r.studentId, v as AttendanceStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Présent</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="SICK">Malade</SelectItem>
                  <SelectItem value="LATE">En retard</SelectItem>
                  <SelectItem value="EXPELLED">Exclu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}


