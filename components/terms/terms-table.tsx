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
import { deleteTerm } from "@/actions/terms";
import { toast } from "sonner";

export type Term = {
  id: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
  academicYearId: string;
  academicYear?: {
    name: string;
  };
  schoolId: string;
};

interface TermsTableProps {
  terms: Term[];
  onRefresh?: () => void;
}

export function TermsTable({ terms, onRefresh }: TermsTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le trimestre "${name}" ?`)) {
      return;
    }

    try {
      const result: any = await deleteTerm(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Trimestre supprimé avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

     const columns: ColumnDef<Term>[] = [
    //  {
    //    accessorKey: "order",
    //    header: ({ column }) => (
    //      <Button
    //        variant="ghost"
    //        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //      >
    //        Ordre
    //        <ArrowUpDown className="ml-2 h-4 w-4" />
    //      </Button>
    //    ),
    //  },
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
       accessorKey: "academicYear.name",
       header: "Année académique",
       cell: ({ row }) => {
         const academicYear = row.original.academicYear;
         return academicYear?.name || "N/A";
       },
     },
    {
      accessorKey: "startDate",
      header: "Date de début",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"));
        return date.toLocaleDateString("fr-FR");
      },
    },
    {
      accessorKey: "endDate",
      header: "Date de fin",
      cell: ({ row }) => {
        const date = new Date(row.getValue("endDate"));
        return date.toLocaleDateString("fr-FR");
      },
    },
    
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const term = row.original;

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
                <Link href={`/terms/${term.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/terms/${term.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
                             <DropdownMenuItem
                 onClick={() => handleDelete(term.id, term.name)}
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
      data={terms}
      searchKey="name"
      searchPlaceholder="Rechercher un trimestre..."
    />
  );
}
