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
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

interface AssessmentsTableProps {
  assessments: any[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const getTypeBadge = (assessment: any) => {
  const name = assessment?.assessmentType?.name || assessment?.type || "Type";
  return <Badge variant="secondary">{name}</Badge>;
};

export function AssessmentsTable({ assessments, onDelete, loading = false }: AssessmentsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);

  const handleDeleteClick = (assessment: any) => {
    setAssessmentToDelete(assessment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;
    
    setDeletingId(assessmentToDelete.id);
    try {
      const result = await deleteAssessment(assessmentToDelete.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Évaluation supprimée avec succès");
        onDelete?.(assessmentToDelete.id);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <>
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
            
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Chargement...
              </TableCell>
            </TableRow>
          ) : assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                    {assessment.createdBy?.user?.name || 
                     (assessment.createdBy?.user?.firstName && assessment.createdBy?.user?.lastName
                       ? `${assessment.createdBy.user.firstName} ${assessment.createdBy.user.lastName}`
                       : assessment.createdBy?.user?.email || 'Enseignant')
                    }
                  </div>
                  {assessment.createdBy?.user?.email && (
                    <div className="text-sm text-muted-foreground">
                      {assessment.createdBy.user.email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{assessment.subject?.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{assessment.classroom?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {assessment.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(assessment)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">{formatDate(assessment.assignedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{assessment.maxScore}</span>
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
                        onClick={() => handleDeleteClick(assessment)}
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

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'évaluation"
        description={`Êtes-vous sûr de vouloir supprimer l'évaluation "${assessmentToDelete?.title}" ? Cette action ne peut pas être annulée.`}
        loading={deletingId === assessmentToDelete?.id}
      />
    </>
  );
}




















