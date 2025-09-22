"use client";

import { useMemo, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getWeeklyTimetable } from "@/actions/timetable-entries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, UserCheck } from "lucide-react";

type EventItem = {
  id?: string;
  title: string;
  start?: string | Date;
  end?: string | Date;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  extendedProps?: Record<string, any>;
};

interface TimetableCalendarProps {
  events: EventItem[];
  subjects: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string; subjectIds?: string[] }>;
  teachersBySubject?: Record<string, Array<{ id: string; name: string }>>;
  classroomId?: string;
  academicYearId: string;
  editable?: boolean;
}

export function TimetableCalendar({
  events: initialEvents,
  subjects,
  teachers,
  teachersBySubject,
  classroomId,
  academicYearId,
  editable = true,
}: TimetableCalendarProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fcEvents = useMemo(() => events, [events]);

  // Update events when initialEvents change
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Function to refresh timetable data
  const refreshTimetable = async () => {
    if (!classroomId) return;
    try {
      const data: any = await getWeeklyTimetable(classroomId);
      if (data?.timetable) {
        const grouped = data.timetable;
        const dayToFc: Record<string, number> = {
          SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
          THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
        };

        const newEvents = Object.entries(grouped).flatMap(([day, arr]: any) => {
          const dow = dayToFc[day] ?? 1;
          return (arr as any[]).map((e) => {
            const st = new Date(e.startTime);
            const et = new Date(e.endTime);
            const toHHmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            return {
              id: e.id,
              title: `${e.subject?.name || "Matière"}\n${toHHmm(st)} - ${toHHmm(et)}\n${e.teacher?.user?.name || "Prof"}`,
              daysOfWeek: [dow],
              startTime: toHHmm(st),
              endTime: toHHmm(et),
              extendedProps: {
                subjectId: e.subjectId,
                teacherId: e.teacherId,
              },
            };
          });
        });
        setEvents(newEvents);
      }
    } catch (error) {
      console.error("Error refreshing timetable:", error);
    }
  };

  const toDayOfWeek = (date: Date) => ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][date.getDay()] || "MONDAY";
  const toHHmm = (date: Date) => `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;

  const filteredTeachers = useMemo(() => {
    const chosenSubjectId = (formValues || {}).subjectId;
    if (!chosenSubjectId) return teachers;
    if (teachersBySubject && teachersBySubject[chosenSubjectId]) {
      const allowed = new Set(teachersBySubject[chosenSubjectId].map(t => t.id));
      return teachers.filter(t => allowed.has(t.id));
    }
    return teachers.filter((t: any) => Array.isArray(t.subjectIds) && t.subjectIds.includes(chosenSubjectId));
  }, [teachers, formValues, teachersBySubject]);

  const dayLabel = (d: string) => ({
    MONDAY: "Lundi",
    TUESDAY: "Mardi",
    WEDNESDAY: "Mercredi",
    THURSDAY: "Jeudi",
    FRIDAY: "Vendredi",
    SATURDAY: "Samedi",
    SUNDAY: "Dimanche",
  } as Record<string, string>)[d] || d;

  return (
    <div className="rounded-md border [&_.fc_.fc-button-primary]:bg-gradient-to-br [&_.fc_.fc-button-primary]:from-blue-500 [&_.fc_.fc-button-primary]:to-indigo-600 [&_.fc_.fc-button-primary]:border-blue-500 [&_.fc_.fc-button-primary]:text-white [&_.fc_.fc-button-primary:hover]:from-blue-600 [&_.fc_.fc-button-primary:hover]:to-indigo-700 [&_.fc_.fc-button-primary:hover]:border-blue-600 [&_.fc_.fc-button-primary:active]:from-blue-700 [&_.fc_.fc-button-primary:active]:to-indigo-800 [&_.fc_.fc-button-primary:focus]:from-blue-700 [&_.fc_.fc-button-primary:focus]:to-indigo-800 [&_.fc_.fc-button-primary:disabled]:bg-gray-400 [&_.fc_.fc-button-primary:disabled]:border-gray-400 [&_.fc_.fc-button-primary:disabled]:opacity-60 [&_.fc_.fc-today-button]:bg-gradient-to-br [&_.fc_.fc-today-button]:from-blue-500 [&_.fc_.fc-today-button]:to-indigo-600 [&_.fc_.fc-today-button]:border-blue-500 [&_.fc_.fc-prev-button]:bg-gradient-to-br [&_.fc_.fc-prev-button]:from-blue-500 [&_.fc_.fc-prev-button]:to-indigo-600 [&_.fc_.fc-prev-button]:border-blue-500 [&_.fc_.fc-next-button]:bg-gradient-to-br [&_.fc_.fc-next-button]:from-blue-500 [&_.fc_.fc-next-button]:to-indigo-600 [&_.fc_.fc-next-button]:border-blue-500 [&_.fc_.fc-timeGridWeek-button]:bg-gradient-to-br [&_.fc_.fc-timeGridWeek-button]:from-blue-500 [&_.fc_.fc-timeGridWeek-button]:to-indigo-600 [&_.fc_.fc-timeGridWeek-button]:border-blue-500 [&_.fc_.fc-timeGridDay-button]:bg-gradient-to-br [&_.fc_.fc-timeGridDay-button]:from-blue-500 [&_.fc_.fc-timeGridDay-button]:to-indigo-600 [&_.fc_.fc-timeGridDay-button]:border-blue-500 [&_.fc_.fc-button-active]:bg-gradient-to-br [&_.fc_.fc-button-active]:from-blue-700 [&_.fc_.fc-button-active]:to-indigo-800 [&_.fc_.fc-button-active]:border-blue-700">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,timeGridDay" }}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        height="auto"
        locale="fr"
        buttonText={{
          today: 'Aujourd\'hui',
          week: 'Semaine',
          day: 'Jour',
          prev: 'Précédent',
          next: 'Suivant'
        }}
        selectable={editable}
        editable={editable}
        events={fcEvents}
        select={editable ? (arg) => {
          if (!classroomId) {
            toast.error("Veuillez sélectionner une classe pour ajouter un cours");
            return;
          }
          setFormValues({
            dayOfWeek: toDayOfWeek(arg.start),
            startTime: toHHmm(arg.start),
            endTime: toHHmm(arg.end),
            classroomId,
          });
          setSheetOpen(true);
        } : undefined}
        eventDrop={editable ? async (info) => {
          const e = info.event;
          if (!e.id) return;
          
          const startTime = e.start ? toHHmm(new Date(e.start)) : undefined;
          const endTime = e.end ? toHHmm(new Date(e.end)) : undefined;
          
          const result = await updateTimetableEntry(e.id, {
            dayOfWeek: toDayOfWeek(new Date(e.start!)),
            startTime: startTime ? new Date(`1970-01-01T${startTime}:00`).toISOString() : undefined,
            endTime: endTime ? new Date(`1970-01-01T${endTime}:00`).toISOString() : undefined,
          });
          
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Cours déplacé avec succès");
          }
          await refreshTimetable();
        } : undefined}
        eventResize={editable ? async (info) => {
          const e = info.event;
          if (!e.id) return;
          
          const startTime = e.start ? toHHmm(new Date(e.start)) : undefined;
          const endTime = e.end ? toHHmm(new Date(e.end)) : undefined;
          
          const result = await updateTimetableEntry(e.id, {
            startTime: startTime ? new Date(`1970-01-01T${startTime}:00`).toISOString() : undefined,
            endTime: endTime ? new Date(`1970-01-01T${endTime}:00`).toISOString() : undefined,
          });
          
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Durée modifiée avec succès");
          }
          await refreshTimetable();
        } : undefined}
        eventClick={(info) => {
          if (!editable) return;
          const e = info.event;
          setFormValues({
            id: e.id,
            subjectId: e.extendedProps?.subjectId || "",
            teacherId: e.extendedProps?.teacherId || "",
            classroomId: e.extendedProps?.classroomId || classroomId,
            dayOfWeek: toDayOfWeek(e.start!),
            startTime: toHHmm(e.start!),
            endTime: e.end ? toHHmm(e.end) : "",
          });
          setSheetOpen(true);
        }}
      />

      {editable && (
        <>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" className="w-full max-w-lg sm:max-w-lg">
              <SheetHeader className="border-b bg-gradient-to-br from-blue-500 to-indigo-600 -mx-6 -mt-6 px-6 py-4 mb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-semibold text-white">
                    {formValues?.id ? "Modifier le cours" : "Ajouter un cours"}
                  </SheetTitle>
                  {formValues?.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => {
                          const id = formValues.id as string;
                          setSheetOpen(false);
                          router.push(`/timetable-entries/${id}/attendance`);
                        }}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-red-500/20"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </SheetHeader>
              
              <form className="flex flex-col h-full" onSubmit={async (e) => {
                e.preventDefault();
                if (isSaving || !formValues.subjectId || !formValues.teacherId || !formValues.startTime || !formValues.endTime || !formValues.classroomId) return;
                
                setIsSaving(true);
                try {
                  if (formValues?.id) {
                    const result = await updateTimetableEntry(formValues.id, {
                      subjectId: formValues.subjectId,
                      teacherId: formValues.teacherId,
                      dayOfWeek: formValues.dayOfWeek,
                      startTime: new Date(`1970-01-01T${formValues.startTime}:00`).toISOString(),
                      endTime: new Date(`1970-01-01T${formValues.endTime}:00`).toISOString(),
                    });
                    if (result?.error) {
                      toast.error(result.error);
                    } else {
                      toast.success("Cours modifié avec succès");
                      setSheetOpen(false);
                      await refreshTimetable();
                    }
                  } else {
                    const result = await createTimetableEntry({
                      classroomId: formValues.classroomId,
                      academicYearId,
                      subjectId: formValues.subjectId,
                      teacherId: formValues.teacherId,
                      dayOfWeek: formValues.dayOfWeek,
                      startTime: new Date(`1970-01-01T${formValues.startTime}:00`).toISOString(),
                      endTime: new Date(`1970-01-01T${formValues.endTime}:00`).toISOString(),
                    });
                    if (result?.error) {
                      toast.error(result.error);
                    } else {
                      toast.success("Cours ajouté avec succès");
                      setSheetOpen(false);
                      await refreshTimetable();
                    }
                  }
                } catch (error) {
                  toast.error("Une erreur s'est produite");
                } finally {
                  setIsSaving(false);
                }
              }}>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Matière *</label>
                      <Select value={formValues.subjectId || ""} onValueChange={(v) => setFormValues((s: any) => ({ ...s, subjectId: v }))}>
                        <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Sélectionnez une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Enseignant *</label>
                      <SearchableSelect
                        options={filteredTeachers.map((t: any) => ({ value: t.id, label: t.name || "Enseignant" }))}
                        value={formValues.teacherId ? filteredTeachers.find((t: any) => t.id === formValues.teacherId) ? { value: formValues.teacherId, label: filteredTeachers.find((t: any) => t.id === formValues.teacherId)?.name || "Enseignant" } : null : null}
                        onChange={(option) => setFormValues((s: any) => ({ ...s, teacherId: option?.value || "" }))}
                        placeholder="Sélectionnez un enseignant"
                        isClearable={false}
                        noOptionsMessage="Aucun enseignant trouvé"
                      />
                      {formValues.subjectId && filteredTeachers.length === 0 && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                          Aucun enseignant assigné pour cette matière
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Jour *</label>
                      <Select value={formValues.dayOfWeek || "MONDAY"} onValueChange={(v) => setFormValues((s: any) => ({ ...s, dayOfWeek: v }))}>
                        <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Sélectionnez un jour" />
                        </SelectTrigger>
                        <SelectContent>
                          {["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"].map((d) => (
                            <SelectItem key={d} value={d}>
                              {dayLabel(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Début *</label>
                        <Input 
                          type="time"
                          value={formValues.startTime || ""} 
                          onChange={(e) => setFormValues((s: any) => ({ ...s, startTime: e.target.value }))} 
                          className="h-11 border-2 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Fin *</label>
                        <Input 
                          type="time"
                          value={formValues.endTime || ""} 
                          onChange={(e) => setFormValues((s: any) => ({ ...s, endTime: e.target.value }))} 
                          className="h-11 border-2 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 border-t bg-white -mx-6 px-6 py-4 mt-6 shadow-lg">
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 h-11" 
                      onClick={() => setSheetOpen(false)}
                      disabled={isSaving}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
                      disabled={isSaving || !formValues.subjectId || !formValues.teacherId || !formValues.startTime || !formValues.endTime || !formValues.classroomId}
                    >
                      {isSaving ? "Enregistrement..." : formValues?.id ? "Mettre à jour" : "Enregistrer"}
                    </Button>
                  </div>
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {/* Dialog de confirmation de suppression */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer le cours</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce cours de l'emploi du temps ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={async () => {
                    if (!formValues.id) return;
                    try {
                      const result = await deleteTimetableEntry(formValues.id);
                      if (result?.error) {
                        toast.error(result.error);
                      } else {
                        toast.success("Cours supprimé avec succès");
                        setDeleteDialogOpen(false);
                        setSheetOpen(false);
                        await refreshTimetable();
                      }
                    } catch (error) {
                      toast.error("Erreur lors de la suppression");
                    }
                  }}
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
