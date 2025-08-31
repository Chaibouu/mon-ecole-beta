"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteClassroom } from "@/actions/classrooms";
import { toast } from "sonner";

export type Classroom = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  gradeLevelId: string;
  gradeLevel?: {
    name: string;
  };
  description?: string;
  schoolId: string;
};

interface ClassroomsTableProps {
  classrooms: Classroom[];
  onRefresh?: () => void;
}

export function ClassroomsTable({ classrooms, onRefresh }: ClassroomsTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la classe "${name}" ?`)) {
      return;
    }

    try {
      const result: any = await deleteClassroom(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Classe supprimée avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Classroom>[] = [
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
      accessorKey: "gradeLevel.name",
      header: "Niveau scolaire",
      cell: ({ row }) => {
        const gradeLevel = row.original.gradeLevel;
        return gradeLevel?.name || "N/A";
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacité",
      cell: ({ row }) => {
        const capacity = row.getValue("capacity") as number;
        return `${capacity} élèves`;
      },
    },
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
        const classroom = row.original;

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
                <Link href={`/classrooms/${classroom.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/classrooms/${classroom.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(classroom.id, classroom.name)}
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
      data={classrooms}
      searchKey="name"
      searchPlaceholder="Rechercher une classe..."
    />
  );
}







