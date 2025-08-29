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
import { deleteTeacher } from "@/actions/school-members";
import { toast } from "sonner";

export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate?: string;
  specialization?: string;
  bio?: string;
  schoolId: string;
};

interface TeachersTableProps {
  teachers: Teacher[];
  onRefresh?: () => void;
}

export function TeachersTable({ teachers, onRefresh }: TeachersTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le professeur "${name}" ?`)) {
      return;
    }

    try {
      const result: any = await deleteTeacher(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Professeur supprimé avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const teacher = row.original;
        return `${teacher.lastName} ${teacher.firstName}`;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return phone || "Non renseigné";
      },
    },
    {
      accessorKey: "specialization",
      header: "Spécialisation",
      cell: ({ row }) => {
        const specialization = row.getValue("specialization") as string;
        return specialization || "Non renseignée";
      },
    },
    {
      accessorKey: "hireDate",
      header: "Date d'embauche",
      cell: ({ row }) => {
        const hireDate = row.getValue("hireDate") as string;
        if (!hireDate) return "Non renseignée";
        return new Date(hireDate).toLocaleDateString("fr-FR");
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const teacher = row.original;

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
                <Link href={`/teachers/${teacher.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/teachers/${teacher.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(teacher.id, `${teacher.lastName} ${teacher.firstName}`)}
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
      data={teachers}
      searchKey="lastName"
      searchPlaceholder="Rechercher un professeur..."
    />
  );
}

