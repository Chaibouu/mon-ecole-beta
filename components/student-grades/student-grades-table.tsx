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
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, User, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { deleteStudentGrade } from "@/actions/student-grades";
import { toast } from "sonner";

interface StudentGradesTableProps {
  grades: any[];
  onDelete?: (id: string) => void;
}

export function StudentGradesTable({ grades, onDelete }: StudentGradesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      setDeletingId(id);
      try {
        const result = await deleteStudentGrade(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Note supprimée avec succès");
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

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {
      return <Badge variant="default">{score}/{maxScore}</Badge>;
    } else if (percentage >= 60) {
      return <Badge variant="secondary">{score}/{maxScore}</Badge>;
    } else if (percentage >= 40) {
      return <Badge variant="outline">{score}/{maxScore}</Badge>;
    } else {
      return <Badge variant="destructive">{score}/{maxScore}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Élève</TableHead>
            <TableHead>Évaluation</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead>Date</TableHead>
            {/* Actions removed */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Aucune note trouvée
              </TableCell>
            </TableRow>
          ) : (
            grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>
                  <div className="font-medium">
                    {grade.student?.user?.name || `${grade.student?.user?.firstName ?? ""} ${grade.student?.user?.lastName ?? ""}`.trim() || grade.student?.user?.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {grade.student?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {grade.assessment?.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {grade.assessment?.assessmentType?.name || grade.assessment?.type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {grade.assessment?.subject?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {grade.assessment?.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {grade.assessment?.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  {getScoreBadge(grade.score, grade.assessment?.maxScore || 20)}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {grade.assessment?.createdBy?.user?.name || `${grade.assessment?.createdBy?.user?.firstName ?? ""} ${grade.assessment?.createdBy?.user?.lastName ?? ""}`.trim() || grade.assessment?.createdBy?.user?.email}
                  </div>
                  {grade.assessment?.createdBy?.user?.email && (
                    <div className="text-sm text-muted-foreground">
                      {grade.assessment.createdBy.user.email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">
                      {grade.createdAt ? formatDate(grade.createdAt) : (grade.gradedAt ? formatDate(grade.gradedAt) : "-")}
                    </span>
                  </div>
                </TableCell>
                {/* Actions removed */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}




















