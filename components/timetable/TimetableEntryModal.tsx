"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Option = { id: string; name: string };

export function TimetableEntryModal({
  isOpen,
  onClose,
  subjects,
  teachers,
  defaults,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjects: Option[];
  teachers: Option[];
  defaults?: Partial<{ subjectId: string; teacherId: string; dayOfWeek: string; startTime: string; endTime: string }>;
  onSubmit: (data: { subjectId: string; teacherId: string; dayOfWeek: string; startTime: string; endTime: string }) => Promise<void> | void;
}) {
  const [subjectId, setSubjectId] = useState(defaults?.subjectId || "");
  const [teacherId, setTeacherId] = useState(defaults?.teacherId || "");
  const [dayOfWeek, setDayOfWeek] = useState(defaults?.dayOfWeek || "MONDAY");
  const [startTime, setStartTime] = useState(defaults?.startTime || "08:00");
  const [endTime, setEndTime] = useState(defaults?.endTime || "09:00");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit({ subjectId, teacherId, dayOfWeek, startTime, endTime });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-full max-w-md p-4 space-y-4">
        <div className="text-lg font-semibold">Cours</div>
        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1">Matière</div>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm mb-1">Professeur</div>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un professeur" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm mb-1">Jour</div>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"] as const).map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm mb-1">Début (HH:mm)</div>
              <Input value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="08:00" />
            </div>
            <div>
              <div className="text-sm mb-1">Fin (HH:mm)</div>
              <Input value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="09:00" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading || !subjectId || !teacherId}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
        </div>
      </div>
    </div>
  );
}












