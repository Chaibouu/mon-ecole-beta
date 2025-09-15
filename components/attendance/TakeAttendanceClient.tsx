"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAttendance, getClassroomStudents, checkExistingAttendance, updateOrCreateAttendance } from "@/actions/attendance-records";
import { getWeeklyTimetable } from "@/actions/timetable-entries";
import { Filter, Users, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TakeAttendanceClientProps {
  academicYearId: string;
  classrooms: Array<{ id: string; name: string; gradeLevel?: string }>;
}

interface Student {
  id: string;
  name: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "SICK" | "EXPELLED";
  notes?: string;
}

interface TimetableEntry {
  id: string;
  subject: { name: string };
  teacher: { user: { name: string } };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export function TakeAttendanceClient({
  academicYearId,
  classrooms,
}: TakeAttendanceClientProps) {
  const router = useRouter();
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState<boolean>(false);

  // Load timetable for selected classroom
  useEffect(() => {
    if (!selectedClassroom) {
      setTimetableEntries([]);
      return;
    }

    const loadTimetable = async () => {
      try {
        const data: any = await getWeeklyTimetable(selectedClassroom);
        if (data?.timetable) {
          const allEntries: TimetableEntry[] = [];
          Object.values(data.timetable).forEach((dayEntries: any) => {
            allEntries.push(...dayEntries);
          });
          setTimetableEntries(allEntries);
        }
      } catch (error) {
        console.error("Error loading timetable:", error);
        toast.error("Erreur lors du chargement de l'emploi du temps");
      }
    };

    loadTimetable();
  }, [selectedClassroom]);

  // Load students for selected classroom and course
  useEffect(() => {
    if (!selectedClassroom || !selectedCourse) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const loadStudents = async () => {
      setLoading(true);
      try {
        const data: any = await getClassroomStudents(selectedClassroom);
        
        if (data?.error) {
          throw new Error(data.error);
        }

        if (!data?.success) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const studentList = Array.isArray(data?.students) ? data.students : [];
        const formattedStudents = studentList.map((s: any) => ({
          id: s.id,
          name: s.user?.name || "N/A",
          status: "PRESENT" as const,
          notes: "",
        }));
        
        setStudents(formattedStudents);
        
        // Initialize attendance with all present
        const initialAttendance: Record<string, Student> = {};
        formattedStudents.forEach((student: Student) => {
          initialAttendance[student.id] = { ...student };
        });
        setAttendance(initialAttendance);
      } catch (error: any) {
        console.error("Error loading students:", error);
        toast.error(`Erreur: ${error.message || "Impossible de charger les élèves"}`);
        setStudents([]);
        setAttendance({});
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedClassroom, selectedCourse]);

  // Check for existing attendance when course is selected
  useEffect(() => {
    if (!selectedCourse || !selectedDate) {
      setExistingAttendance(false);
      return;
    }

    const checkAttendance = async () => {
      try {
        const data: any = await checkExistingAttendance(selectedCourse, selectedDate);
        const records = Array.isArray(data?.attendanceRecords) ? data.attendanceRecords : [];
        setExistingAttendance(records.length > 0);
        
        if (records.length > 0) {
          toast.warning("Des présences ont déjà été enregistrées pour ce cours. Vous pouvez les modifier.");
          
          // Load existing attendance data
          const existingAttendanceMap: Record<string, Student> = {};
          
          // First, get all students for this classroom to ensure we have complete data
          const studentsData: any = await getClassroomStudents(selectedClassroom);
          if (studentsData?.success && studentsData?.students) {
            // Initialize all students with PRESENT status
            studentsData.students.forEach((s: any) => {
              existingAttendanceMap[s.id] = {
                id: s.id,
                name: s.user?.name || "N/A",
                status: "PRESENT" as const,
                notes: "",
              };
            });
            
            // Override with existing attendance records
            records.forEach((record: any) => {
              if (existingAttendanceMap[record.studentId]) {
                existingAttendanceMap[record.studentId] = {
                  id: record.studentId,
                  name: record.student?.user?.name || existingAttendanceMap[record.studentId].name,
                  status: record.status || "PRESENT",
                  notes: record.notes || "",
                };
              }
            });
            
            setAttendance(existingAttendanceMap);
            setStudents(Object.values(existingAttendanceMap));
          }
        }
      } catch (error) {
        console.error("Error checking existing attendance:", error);
      }
    };

    checkAttendance();
  }, [selectedCourse, selectedDate]);

  // Filter courses for selected date
  const availableCourses = useMemo(() => {
    if (!selectedDate || !timetableEntries.length) return [];
    
    const selectedDateObj = new Date(selectedDate);
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const dayOfWeek = dayNames[selectedDateObj.getDay()];
    
    return timetableEntries
      .filter(entry => entry.dayOfWeek === dayOfWeek)
      .map(entry => {
        // Format time properly from ISO string
        const formatTime = (timeStr: string) => {
          try {
            const date = new Date(timeStr);
            return date.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
          } catch {
            // Fallback if it's already in HH:MM format
            return timeStr.slice(0, 5);
          }
        };
        
        const startTime = formatTime(entry.startTime);
        const endTime = formatTime(entry.endTime);
        
        return {
          value: entry.id,
          label: `${entry.subject.name} - ${startTime} à ${endTime} (${entry.teacher.user.name})`,
          entry,
        };
      });
  }, [selectedDate, timetableEntries]);

  const classroomOptions = useMemo(() => 
    classrooms.map(c => ({
      value: c.id,
      label: `${c.name}${c.gradeLevel ? ` (${c.gradeLevel})` : ""}`,
    })),
    [classrooms]
  );

  const updateStudentStatus = (studentId: string, status: Student['status'], notes?: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        notes: notes !== undefined ? notes : prev[studentId]?.notes || "",
      }
    }));
  };

  const saveAttendance = async () => {
    if (!selectedCourse || Object.keys(attendance).length === 0) {
      toast.error("Veuillez sélectionner un cours et avoir des élèves");
      return;
    }

    setSaving(true);
    try {
      const promises = Object.values(attendance).map(student => 
        updateOrCreateAttendance(
          student.id,
          selectedDate,
          student.status || "PRESENT",
          selectedCourse,
          student.notes || undefined
        )
      );

      const results = await Promise.allSettled(promises);
      const errors = results.filter(r => r.status === 'rejected').length;
      const successes = results.filter(r => r.status === 'fulfilled').length;

      if (errors === 0) {
        const message = existingAttendance 
          ? `Présences modifiées avec succès (${successes} élèves)`
          : `Présences enregistrées avec succès (${successes} élèves)`;
        toast.success(message);
        // Reset form
        setSelectedCourse("");
        setAttendance({});
        setStudents([]);
        setExistingAttendance(false);
      } else {
        const action = existingAttendance ? "modifiées" : "enregistrées";
        toast.warning(`${successes} présences ${action}, ${errors} erreurs`);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case "PRESENT": return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT": return "bg-red-100 text-red-800 border-red-200";
      case "LATE": return "bg-orange-100 text-orange-800 border-orange-200";
      case "SICK": return "bg-blue-100 text-blue-800 border-blue-200";
      case "EXPELLED": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Student['status']) => {
    switch (status) {
      case "PRESENT": return <CheckCircle className="h-4 w-4" />;
      case "ABSENT": return <XCircle className="h-4 w-4" />;
      case "LATE": return <Clock className="h-4 w-4" />;
      case "SICK": return <AlertTriangle className="h-4 w-4" />;
      case "EXPELLED": return <XCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const stats = useMemo(() => {
    const values = Object.values(attendance);
    return {
      total: values.length,
      present: values.filter(s => s.status === "PRESENT").length,
      absent: values.filter(s => s.status === "ABSENT").length,
      late: values.filter(s => s.status === "LATE").length,
      sick: values.filter(s => s.status === "SICK").length,
    };
  }, [attendance]);

  return (
    <div className="space-y-6 pb-8">
      {/* Filtres et sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Sélection du cours
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[120px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe</label>
              <SearchableSelect
                options={classroomOptions}
                value={selectedClassroom ? classroomOptions.find(c => c.value === selectedClassroom) || null : null}
                onChange={(option) => {
                  setSelectedClassroom(option?.value || "");
                  setSelectedCourse("");
                }}
                placeholder="Sélectionnez une classe"
                isClearable={true}
                noOptionsMessage="Aucune classe trouvée"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedCourse("");
                }}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cours</label>
              <SearchableSelect
                options={availableCourses}
                value={selectedCourse ? availableCourses.find(c => c.value === selectedCourse) || null : null}
                onChange={(option) => setSelectedCourse(option?.value || "")}
                placeholder="Sélectionnez un cours"
                isClearable={true}
                noOptionsMessage="Aucun cours ce jour"
                isDisabled={!selectedClassroom || !selectedDate}
              />
              {existingAttendance && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Présences déjà enregistrées - Mode modification
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      {Object.keys(attendance).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-muted-foreground">Présents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-muted-foreground">Absents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
              <div className="text-sm text-muted-foreground">Retards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.sick}</div>
              <div className="text-sm text-muted-foreground">Malades</div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Liste des élèves */}
      {!loading && Object.keys(attendance).length > 0 && (
        <Card>
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Liste des élèves ({stats.total})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newAttendance = { ...attendance };
                    Object.keys(newAttendance).forEach(id => {
                      newAttendance[id].status = "PRESENT";
                    });
                    setAttendance(newAttendance);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tous présents
                </Button>
                <Button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : existingAttendance ? "Modifier" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-4 py-4">
              {Object.values(attendance).map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {student.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{student.name}</h4>
                          {existingAttendance && (student.status !== "PRESENT" || student.notes) && (
                            <Badge variant="outline" className="text-xs">
                              Modifié
                            </Badge>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(student.status)} flex items-center gap-1`}>
                          {getStatusIcon(student.status)}
                          {student.status === "PRESENT" ? "Présent" :
                           student.status === "ABSENT" ? "Absent" :
                           student.status === "LATE" ? "Retard" :
                           student.status === "SICK" ? "Malade" : "Exclu"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Quick action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={student.status === "PRESENT" ? "default" : "outline"}
                        onClick={() => updateStudentStatus(student.id, "PRESENT")}
                        className={student.status === "PRESENT" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "ABSENT" ? "destructive" : "outline"}
                        onClick={() => updateStudentStatus(student.id, "ABSENT")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "LATE" ? "default" : "outline"}
                        onClick={() => updateStudentStatus(student.id, "LATE")}
                        className={student.status === "LATE" ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <Select 
                        value={student.status} 
                        onValueChange={(value) => updateStudentStatus(student.id, value as Student['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Présent</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="LATE">Retard</SelectItem>
                          <SelectItem value="SICK">Malade</SelectItem>
                          <SelectItem value="EXPELLED">Exclu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes (optionnel)</label>
                      <Textarea
                        value={student.notes || ""}
                        onChange={(e) => updateStudentStatus(student.id, student.status, e.target.value)}
                        placeholder="Commentaire..."
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !selectedClassroom && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sélectionnez une classe</h3>
            <p className="text-muted-foreground">
              Choisissez une classe pour commencer à faire l'appel.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && selectedClassroom && availableCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucun cours programmé</h3>
            <p className="text-muted-foreground">
              Aucun cours n'est programmé pour cette classe à la date sélectionnée.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
