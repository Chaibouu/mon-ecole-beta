"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { deleteAttendanceRecord } from "@/actions/attendance-records";
import { toast } from "sonner";

interface AttendanceRecordsTableProps {
  records: any[];
  onDelete?: (id: string) => void;
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

export function AttendanceRecordsTable({ records, onDelete }: AttendanceRecordsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement de présence ?")) {
      setDeletingId(id);
      try {
        const result = await deleteAttendanceRecord(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Enregistrement supprimé avec succès");
          onDelete?.(id);
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Élève</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Aucun enregistrement de présence trouvé
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium">
                    {record.student?.user?.firstName} {record.student?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.student?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {record.teacherAssignment?.teacher?.user?.firstName} {record.teacherAssignment?.teacher?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.teacherAssignment?.teacher?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {record.teacherAssignment?.subject?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {record.teacherAssignment?.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.teacherAssignment?.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">
                      {formatDate(record.date)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(record.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/attendance-records/${record.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/attendance-records/${record.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === record.id ? "Suppression..." : "Supprimer"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}





















