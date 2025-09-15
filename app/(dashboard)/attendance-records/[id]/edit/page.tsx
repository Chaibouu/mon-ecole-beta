import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceRecordFormWrapper } from "@/components/attendance-records/attendance-record-form-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAttendanceRecordById } from "@/actions/attendance-records";
import { listStudents } from "@/actions/school-members";
import { listTimetableEntries } from "@/actions/timetable-entries";
import { notFound } from "next/navigation";

interface EditAttendanceRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAttendanceRecordPage({ params }: EditAttendanceRecordPageProps) {
  const { id } = await params;
  
  const [recordData, studentsData, timetableEntriesData] = await Promise.all([
    getAttendanceRecordById(id),
    listStudents(),
    listTimetableEntries(),
  ]);

  if (recordData?.error || !recordData?.attendanceRecord) {
    notFound();
  }

  const record = recordData.attendanceRecord;
  const students = Array.isArray(studentsData?.students) ? studentsData.students : [];
  const timetableEntries = Array.isArray(timetableEntriesData?.timetableEntries) ? timetableEntriesData.timetableEntries : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/attendance-records/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'enregistrement de présence</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de l'enregistrement de présence
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'enregistrement de présence</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceRecordFormWrapper 
            mode="edit"
            initialData={record}
            recordId={id}
            students={students}
            timetableEntries={timetableEntries}
          />
        </CardContent>
      </Card>
    </div>
  );
}





