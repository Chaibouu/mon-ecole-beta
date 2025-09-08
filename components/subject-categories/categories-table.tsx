"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteSubjectCategory } from "@/actions/subject-categories";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

type Item = { id: string; name: string; description?: string };

export function CategoriesTable({ items, onRefresh }: { items: Item[]; onRefresh?: () => void }) {
  const handleDelete = async (id: string, name: string) => {
    
    const res: any = await deleteSubjectCategory(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Catégorie supprimée");
      onRefresh?.();
    }
  };

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const it = row.original;
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
                <Link href={`/subject-categories/${it.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={(e) => e.preventDefault()}>
                 <Dialog >
                  <DialogTrigger asChild>
                    <span className="flex"> <Trash className="mr-2 h-4 w-4" />Supprimer</span>
                  </DialogTrigger>
                  <DialogContent>

                  <div className="text-sm">
                    Êtes-vous sûr de vouloir supprimer la categorie "{it.name}" ?
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(it.id, it.name)}
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
    <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="Rechercher une catégorie..." />
  );
}






