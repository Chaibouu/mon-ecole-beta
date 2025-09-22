"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { getAttendanceAnalytics } from "@/actions/attendance-records";
import { Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, Users, Calendar, AlertTriangle, CheckCircle, Clock, UserX, BookOpen, GraduationCap, Eye } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface AttendanceAnalyticsClientProps {
  academicYearId: string;
  classrooms: Array<{ id: string; name: string; gradeLevel?: string }>;
  subjects: Array<{ id: string; name: string }>;
}

const chartConfig = {
  present: {
    label: "Présent",
    color: "hsl(142, 76%, 36%)",
  },
  absent: {
    label: "Absent",
    color: "hsl(0, 84%, 60%)",
  },
  late: {
    label: "Retard",
    color: "hsl(38, 92%, 50%)",
  },
  sick: {
    label: "Malade",
    color: "hsl(221, 83%, 53%)",
  },
  expelled: {
    label: "Exclu",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

const COLORS = {
  PRESENT: "#22c55e",
  ABSENT: "#ef4444", 
  LATE: "#f59e0b",
  SICK: "#3b82f6",
  EXPELLED: "#8b5cf6",
};

export function AttendanceAnalyticsClient({
  academicYearId,
  classrooms,
  subjects,
}: AttendanceAnalyticsClientProps) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    from: format(startOfWeek(subDays(new Date(), 30)), "yyyy-MM-dd"),
    to: format(endOfWeek(new Date()), "yyyy-MM-dd"),
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load attendance analytics data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const filters: any = {
          academicYearId,
          from: dateRange.from,
          to: dateRange.to,
        };
        if (selectedClassroom) filters.classroomId = selectedClassroom;
        if (selectedSubject) filters.subjectId = selectedSubject;

        const result = await getAttendanceAnalytics(filters);
        if (result?.success && result?.data) {
          setAnalyticsData(result.data);
        } else {
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error("Error loading attendance analytics:", error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClassroom, selectedSubject, dateRange, academicYearId]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!analyticsData?.attendanceRecords?.length) return { statusChart: [], dailyChart: [], weeklyChart: [] };

    // Use pre-processed data from analytics API
    const statusChart = Object.entries(analyticsData.summary.statusCounts).map(([status, count]) => ({
      status: status === "PRESENT" ? "Présent" : 
              status === "ABSENT" ? "Absent" :
              status === "LATE" ? "Retard" :
              status === "SICK" ? "Malade" : "Exclu",
      count,
      fill: COLORS[status as keyof typeof COLORS] || "#8884d8",
    }));

    // Format daily data for charts
    const dailyChart = analyticsData.trends.daily.map((day: any) => ({
      date: format(new Date(day.date), "dd/MM"),
      PRESENT: day.PRESENT || 0,
      ABSENT: day.ABSENT || 0,
      LATE: day.LATE || 0,
      SICK: day.SICK || 0,
      EXPELLED: day.EXPELLED || 0,
    }));

    // Format weekly data for charts
    const weeklyChart = analyticsData.trends.weekly.map((week: any) => ({
      week: `Semaine du ${format(new Date(week.weekStart), "dd/MM")}`,
      present: week.present,
      absent: week.absent,
      total: week.total,
      rate: week.rate,
    }));

    return { statusChart, dailyChart, weeklyChart };
  }, [analyticsData]);

  // Statistics from analytics API
  const stats = useMemo(() => {
    if (!analyticsData?.summary) return { total: 0, present: 0, absent: 0, late: 0, rate: 0 };

    const { totalRecords, statusCounts, attendanceRate } = analyticsData.summary;
    return { 
      total: totalRecords, 
      present: statusCounts.PRESENT || 0, 
      absent: statusCounts.ABSENT || 0, 
      late: statusCounts.LATE || 0, 
      rate: attendanceRate 
    };
  }, [analyticsData]);

  // Detailed analytics by subject, teacher, and daily
  const detailedAnalytics = useMemo(() => {
    if (!analyticsData?.attendanceRecords?.length) return { bySubject: [], byTeacher: [], byDay: [] };

    const records = analyticsData.attendanceRecords;

    // Group by subject
    const subjectGroups = records.reduce((acc: any, record: any) => {
      const subject = record.timetableEntry?.subject || "N/A";
      if (!acc[subject]) {
        acc[subject] = { present: 0, absent: 0, late: 0, sick: 0, total: 0 };
      }
      acc[subject][record.status?.toLowerCase() || 'present']++;
      acc[subject].total++;
      return acc;
    }, {});

    const bySubject = Object.entries(subjectGroups).map(([subject, stats]: [string, any]) => ({
      subject,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    // Group by teacher
    const teacherGroups = records.reduce((acc: any, record: any) => {
      const teacher = record.timetableEntry?.teacher || "N/A";
      if (!acc[teacher]) {
        acc[teacher] = { present: 0, absent: 0, late: 0, sick: 0, total: 0 };
      }
      acc[teacher][record.status?.toLowerCase() || 'present']++;
      acc[teacher].total++;
      return acc;
    }, {});

    const byTeacher = Object.entries(teacherGroups).map(([teacher, stats]: [string, any]) => ({
      teacher,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    // Group by day with more details
    const dayGroups = records.reduce((acc: any, record: any) => {
      const date = format(new Date(record.date), "yyyy-MM-dd");
      const dayName = format(new Date(record.date), "EEEE dd/MM", { locale: fr });
      if (!acc[date]) {
        acc[date] = { 
          date, 
          dayName,
          present: 0, 
          absent: 0, 
          late: 0, 
          sick: 0, 
          total: 0,
          subjects: new Set(),
          teachers: new Set()
        };
      }
      acc[date][record.status?.toLowerCase() || 'present']++;
      acc[date].total++;
      if (record.timetableEntry?.subject) acc[date].subjects.add(record.timetableEntry.subject);
      if (record.timetableEntry?.teacher) acc[date].teachers.add(record.timetableEntry.teacher);
      return acc;
    }, {});

    const byDay = Object.values(dayGroups).map((day: any) => ({
      ...day,
      subjects: Array.from(day.subjects).join(', '),
      teachers: Array.from(day.teachers).join(', '),
      subjectsCount: day.subjects.size,
      teachersCount: day.teachers.size,
      rate: day.total > 0 ? Math.round((day.present / day.total) * 100) : 0,
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { bySubject, byTeacher, byDay };
  }, [analyticsData]);

  const classroomOptions = useMemo(() => 
    classrooms.map(c => ({
      value: c.id,
      label: `${c.name}${c.gradeLevel ? ` (${c.gradeLevel})` : ""}`,
    })),
    [classrooms]
  );

  const subjectOptions = useMemo(() => 
    subjects.map(s => ({
      value: s.id,
      label: s.name,
    })),
    [subjects]
  );

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe</label>
              <SearchableSelect
                options={classroomOptions}
                value={selectedClassroom ? classroomOptions.find(c => c.value === selectedClassroom) || null : null}
                onChange={(option) => setSelectedClassroom(option?.value || "")}
                placeholder="Toutes les classes"
                isClearable={true}
                noOptionsMessage="Aucune classe trouvée"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Matière</label>
              <SearchableSelect
                options={subjectOptions}
                value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject) || null : null}
                onChange={(option) => setSelectedSubject(option?.value || "")}
                placeholder="Toutes les matières"
                isClearable={true}
                noOptionsMessage="Aucune matière trouvée"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Du</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Au</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total enregistrements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absents</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de présence</p>
                <p className="text-2xl font-bold text-blue-600">{stats.rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="daily">Par jour</TabsTrigger>
            <TabsTrigger value="subjects">Par matière</TabsTrigger>
            <TabsTrigger value="teachers">Par enseignant</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble - Graphiques */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en secteurs - Répartition des statuts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Répartition des présences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.statusChart}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {chartData.statusChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Graphique en aires - Évolution hebdomadaire */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution du taux de présence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.weeklyChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip 
                          content={<ChartTooltipContent />} 
                          formatter={(value) => [`${value}%`, "Taux de présence"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#3b82f6" 
                          fill="url(#colorRate)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Graphique en barres - Présences par jour */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Présences quotidiennes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.dailyChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="PRESENT" stackId="a" fill={COLORS.PRESENT} name="Présent" />
                        <Bar dataKey="ABSENT" stackId="a" fill={COLORS.ABSENT} name="Absent" />
                        <Bar dataKey="LATE" stackId="a" fill={COLORS.LATE} name="Retard" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vue par jour */}
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Analyse journalière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedAnalytics.byDay.map((day: any) => (
                    <div key={day.date} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{day.dayName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {day.subjectsCount} matière(s) • {day.teachersCount} enseignant(s)
                          </p>
                        </div>
                        <Badge variant={day.rate >= 90 ? "default" : day.rate >= 75 ? "secondary" : "destructive"}>
                          {day.rate}% présence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{day.present}</div>
                          <div className="text-xs text-muted-foreground">Présents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{day.absent}</div>
                          <div className="text-xs text-muted-foreground">Absents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{day.late}</div>
                          <div className="text-xs text-muted-foreground">Retards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{day.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Matières:</strong> {day.subjects}</p>
                        <p><strong>Enseignants:</strong> {day.teachers}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vue par matière */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Analyse par matière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedAnalytics.bySubject.map((subject: any) => (
                    <div key={subject.subject} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{subject.subject}</h4>
                        <Badge variant={subject.rate >= 90 ? "default" : subject.rate >= 75 ? "secondary" : "destructive"}>
                          {subject.rate}% présence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{subject.present}</div>
                          <div className="text-xs text-muted-foreground">Présents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{subject.absent}</div>
                          <div className="text-xs text-muted-foreground">Absents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{subject.late}</div>
                          <div className="text-xs text-muted-foreground">Retards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{subject.sick}</div>
                          <div className="text-xs text-muted-foreground">Malades</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{subject.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vue par enseignant */}
          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Analyse par enseignant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedAnalytics.byTeacher.map((teacher: any) => (
                    <div key={teacher.teacher} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{teacher.teacher}</h4>
                        <Badge variant={teacher.rate >= 90 ? "default" : teacher.rate >= 75 ? "secondary" : "destructive"}>
                          {teacher.rate}% présence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{teacher.present}</div>
                          <div className="text-xs text-muted-foreground">Présents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{teacher.absent}</div>
                          <div className="text-xs text-muted-foreground">Absents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{teacher.late}</div>
                          <div className="text-xs text-muted-foreground">Retards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{teacher.sick}</div>
                          <div className="text-xs text-muted-foreground">Malades</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{teacher.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!loading && !analyticsData?.attendanceRecords?.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune donnée trouvée</h3>
            <p className="text-muted-foreground">
              Aucun enregistrement de présence ne correspond aux filtres sélectionnés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
