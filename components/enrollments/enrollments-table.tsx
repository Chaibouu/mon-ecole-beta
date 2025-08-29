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
import { deleteEnrollment } from "@/actions/enrollments";
import { toast } from "sonner";

interface EnrollmentsTableProps {
  enrollments: any[];
  onDelete?: (id: string) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="default">Actif</Badge>;
    case "INACTIVE":
      return <Badge variant="secondary">Inactif</Badge>;
    case "GRADUATED":
      return <Badge variant="outline">Diplômé</Badge>;
    case "TRANSFERRED":
      return <Badge variant="destructive">Transféré</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function EnrollmentsTable({ enrollments, onDelete }: EnrollmentsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette inscription ?")) {
      setDeletingId(id);
      try {
        const result = await deleteEnrollment(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Inscription supprimée avec succès");
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
            <TableHead>Classe</TableHead>
            <TableHead>Année académique</TableHead>
            
            <TableHead>Statut</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Aucune inscription trouvée
              </TableCell>
            </TableRow>
          ) : (
            enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="font-medium">
                    {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {enrollment.student?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {enrollment.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {enrollment.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {enrollment.academicYear?.name}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(enrollment.status)}
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
                        <Link href={`/enrollments/${enrollment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/enrollments/${enrollment.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(enrollment.id)}
                        disabled={deletingId === enrollment.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === enrollment.id ? "Suppression..." : "Supprimer"}
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





