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
import { MoreHorizontal, Edit, Trash2, Eye, BookOpen, GraduationCap, Clock } from "lucide-react";
import Link from "next/link";
import { deleteClassroomSubject } from "@/actions/classroom-subjects";
import { toast } from "sonner";

interface ClassroomSubjectsTableProps {
  classroomSubjects: any[];
  onDelete?: (id: string) => void;
}

export function ClassroomSubjectsTable({ classroomSubjects, onDelete }: ClassroomSubjectsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette matière par classe ?")) {
      setDeletingId(id);
      try {
        const result = await deleteClassroomSubject(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Matière par classe supprimée avec succès");
          onDelete?.(id);
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Classe</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Année académique</TableHead>
            <TableHead>Heures/semaine</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classroomSubjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucune matière par classe trouvée
              </TableCell>
            </TableRow>
          ) : (
            classroomSubjects.map((classroomSubject) => (
              <TableRow key={classroomSubject.id}>
                <TableCell>
                  <div className="font-medium">
                    {classroomSubject.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {classroomSubject.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {classroomSubject.subject?.name}
                  </Badge>
                  {classroomSubject.subject?.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {classroomSubject.subject.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {classroomSubject.academicYear?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{classroomSubject.hoursPerWeek}h/sem</span>
                  </div>
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
                        <Link href={`/classroom-subjects/${classroomSubject.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/classroom-subjects/${classroomSubject.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(classroomSubject.id)}
                        disabled={deletingId === classroomSubject.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === classroomSubject.id ? "Suppression..." : "Supprimer"}
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




















