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
import { deleteAcademicYear } from "@/actions/academic-years";
import { toast } from "sonner";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTrigger } from "../ui/dialog";

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  schoolId: string;
};

interface AcademicYearsTableProps {
  academicYears: AcademicYear[];
  onRefresh?: () => void;
}

export function AcademicYearsTable({ academicYears, onRefresh }: AcademicYearsTableProps) {
  const handleDelete = async (id: string, name: string) => {
    // if (!confirm(`Êtes-vous sûr de vouloir supprimer l'année académique "${name}" ?`)) {
    //   return;
    // }

    try {
      const result: any = await deleteAcademicYear(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Année académique supprimée avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<AcademicYear>[] = [
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
    {
      accessorKey: "startDate",
      header: "Date de début",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "endDate",
      header: "Date de fin",
      cell: ({ row }) => {
        const date = new Date(row.getValue("endDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const academicYear = row.original;

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
                <Link href={`/academic-years/${academicYear.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/academic-years/${academicYear.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  // handleDelete(academicYear.id, academicYear.name);
                }}
                className="text-red-600"
                disabled={academicYear.isActive}
              >
                {/* <Trash className="mr-2 h-4 w-4" /> */}
                <Dialog >
                  <DialogTrigger asChild>
                    <span className="flex"> <Trash className="mr-2 h-4 w-4" />Supprimer</span>
                  </DialogTrigger>
                  <DialogContent>

                  <div className="text-sm">
                    {academicYear.isActive
                      ? "Vous ne pouvez pas supprimer une année académique active."
                      : `Êtes-vous sûr de vouloir supprimer l'année académique "${academicYear.name}" ? Cette action est irréversible.`}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(academicYear.id, academicYear.name)}
                      disabled={academicYear.isActive}
                    >
                      Supprimer
                    </Button>
                  </div>
                  </DialogContent>

                </Dialog>
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
      data={academicYears}
      searchKey="name"
      searchPlaceholder="Rechercher une année académique..."
    />
  );
}
