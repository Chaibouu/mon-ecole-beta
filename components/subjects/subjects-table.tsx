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
import { deleteSubject } from "@/actions/subjects";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export type Subject = {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  schoolId: string;
  category?: { id: string; name: string } | null;
};

interface SubjectsTableProps {
  subjects: Subject[];
  onRefresh?: () => void;
}

export function SubjectsTable({ subjects, onRefresh }: SubjectsTableProps) {
  const handleDelete = async (id: string, name: string) => {
    try {
      const result: any = await deleteSubject(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Matière supprimée avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Subject>[] = [
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
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "color",
      header: "Couleur",
      cell: ({ row }) => {
        const color = row.getValue("color") as string;
        if (!color) return "Aucune couleur";
        
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm">{color}</span>
          </div>
        );
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
      accessorKey: "category.name",
      header: "Catégorie",
      cell: ({ row }) => {
        const cat = row.original.category as any;
        return cat?.name || "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subject = row.original;

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
                <Link href={`/subjects/${subject.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/subjects/${subject.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => e.preventDefault()}
                className="text-red-600"
              >
                 <Dialog >
                  <DialogTrigger asChild>
                    <span className="flex"> <Trash className="mr-2 h-4 w-4" />Supprimer</span>
                  </DialogTrigger>
                  <DialogContent>

                  <div className="text-sm">
                    Êtes-vous sûr de vouloir supprimer la matière "{subject.name}" ?
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subject.id, subject.name)}
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
      data={subjects}
      searchKey="name"
      searchPlaceholder="Rechercher une matière..."
    />
  );
}








