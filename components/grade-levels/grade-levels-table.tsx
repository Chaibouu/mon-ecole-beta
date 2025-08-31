"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteGradeLevel } from "@/actions/grade-levels";
import { toast } from "sonner";

export type GradeLevel = {
  id: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  schoolId: string;
};

interface GradeLevelsTableProps {
  gradeLevels: GradeLevel[];
  onRefresh?: () => void;
}

export function GradeLevelsTable({ gradeLevels, onRefresh }: GradeLevelsTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le niveau "${name}" ?`)) {
      return;
    }

    try {
      const result: any = await deleteGradeLevel(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Niveau scolaire supprimé avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<GradeLevel>[] = [
    // {
    //   accessorKey: "order",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Ordre
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    // },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    // {
    //   accessorKey: "code",
    //   header: "Code",
    // },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description || "Aucune description";
      },
    },
    
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const gradeLevel = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/grade-levels/${gradeLevel.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/grade-levels/${gradeLevel.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
                             <DropdownMenuItem
                 onClick={() => handleDelete(gradeLevel.id, gradeLevel.name)}
                 className="text-red-600"
               >
                <Trash className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={gradeLevels}
      searchKey="name"
      searchPlaceholder="Rechercher un niveau scolaire..."
    />
  );
}
