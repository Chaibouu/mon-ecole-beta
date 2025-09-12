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
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { deleteAssessment } from "@/actions/assessments";
import { toast } from "sonner";

interface AssessmentsTableProps {
  assessments: any[];
  onDelete?: (id: string) => void;
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "EXAM":
      return <Badge variant="destructive">Examen</Badge>;
    case "QUIZ":
      return <Badge variant="secondary">Quiz</Badge>;
    case "HOMEWORK":
      return <Badge variant="outline">Devoir</Badge>;
    case "PROJECT":
      return <Badge variant="default">Projet</Badge>;
    case "PRESENTATION":
      return <Badge variant="secondary">Présentation</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

export function AssessmentsTable({ assessments, onDelete }: AssessmentsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      setDeletingId(id);
      try {
        const result = await deleteAssessment(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Évaluation supprimée avec succès");
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
            <TableHead>Titre</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score max</TableHead>
            <TableHead>Poids</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Aucune évaluation trouvée
              </TableCell>
            </TableRow>
          ) : (
            assessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell>
                  <div className="font-medium">
                    {assessment.title}
                  </div>
                  {assessment.description && (
                    <div className="text-sm text-muted-foreground">
                      {assessment.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {assessment.teacherAssignment?.teacher?.user?.firstName} {assessment.teacherAssignment?.teacher?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assessment.teacherAssignment?.teacher?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {assessment.teacherAssignment?.subject?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {assessment.teacherAssignment?.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assessment.teacherAssignment?.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  {getTypeBadge(assessment.type)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">
                      {formatDate(assessment.assessmentDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{assessment.maxScore}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{assessment.weight}%</span>
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
                        <Link href={`/assessments/${assessment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/assessments/${assessment.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(assessment.id)}
                        disabled={deletingId === assessment.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === assessment.id ? "Suppression..." : "Supprimer"}
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

















