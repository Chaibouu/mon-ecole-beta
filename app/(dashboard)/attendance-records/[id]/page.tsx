import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, CheckCircle, Calendar, User, BookOpen, GraduationCap } from "lucide-react";
import { getAttendanceRecordById } from "@/actions/attendance-records";
import { notFound } from "next/navigation";

interface AttendanceRecordDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PRESENT":
      return <Badge variant="default">Présent</Badge>;
    case "ABSENT":
      return <Badge variant="destructive">Absent</Badge>;
    case "LATE":
      return <Badge variant="secondary">En retard</Badge>;
    case "EXCUSED":
      return <Badge variant="outline">Excusé</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

export default async function AttendanceRecordDetailPage({ params }: AttendanceRecordDetailPageProps) {
  const { id } = await params;
  const data: any = await getAttendanceRecordById(id);

  if (data?.error || !data?.attendanceRecord) {
    notFound();
  }

  const record = data.attendanceRecord;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/attendance-records">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Présence - {record.student?.user?.firstName} {record.student?.user?.lastName}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'enregistrement de présence
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/attendance-records/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Élève:</span>
              <span>
                {record.student?.user?.firstName} {record.student?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{record.student?.user?.email}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{formatDate(record.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Statut:</span>
              {getStatusBadge(record.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes et métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {record.notes}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{record.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Élève ID:</span>
              <span className="font-mono text-sm">{record.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Timetable Entry ID:</span>
              <span className="font-mono text-sm">{record.timetableEntryId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Enseignant ID:</span>
              <span className="font-mono text-sm">{record.teacherAssignment?.teacherId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matière ID:</span>
              <span className="font-mono text-sm">{record.teacherAssignment?.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classe ID:</span>
              <span className="font-mono text-sm">{record.teacherAssignment?.classroomId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





