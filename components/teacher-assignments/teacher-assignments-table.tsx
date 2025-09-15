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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { deleteTeacherAssignment } from "@/actions/teacher-assignments";
import { toast } from "sonner";

interface TeacherAssignmentsTableProps {
  assignments: any[];
  onDelete?: (id: string) => void;
}

export function TeacherAssignmentsTable({ assignments, onDelete }: TeacherAssignmentsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette affectation ?")) {
      setDeletingId(id);
      try {
        const result = await deleteTeacherAssignment(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Affectation supprimée avec succès");
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
            <TableHead>Enseignant</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Année académique</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucune affectation trouvée
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="font-medium">
                    {assignment.teacher?.user?.firstName} {assignment.teacher?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.teacher?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {assignment.subject?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {assignment.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assignment.academicYear?.name}
                  </Badge>
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
                        <Link href={`/teacher-assignments/${assignment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/teacher-assignments/${assignment.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(assignment.id)}
                        disabled={deletingId === assignment.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === assignment.id ? "Suppression..." : "Supprimer"}
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
