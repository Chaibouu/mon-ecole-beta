import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceRecordsTableWrapper } from "@/components/attendance-records/attendance-records-table-wrapper";
import { listAttendanceRecords } from "@/actions/attendance-records";
import Link from "next/link";
import { Plus, CheckCircle } from "lucide-react";

export default async function AttendanceRecordsPage() {
  const data: any = await listAttendanceRecords();
  if (data?.error) {
    throw new Error(data.error);
  }

  const records = Array.isArray(data?.attendanceRecords) ? data.attendanceRecords : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Présences</h1>
          <p className="text-muted-foreground">
            Gérez les présences des élèves
          </p>
        </div>
        <Button asChild>
          <Link href="/attendance-records/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer un enregistrement
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Liste des enregistrements de présence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceRecordsTableWrapper initialRecords={records} />
        </CardContent>
      </Card>
    </div>
  );
}






