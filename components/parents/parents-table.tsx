"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  User,
  Phone,
  MapPin,
  RefreshCw,
  Heart
} from "lucide-react";
import { deleteParent } from "@/actions/parents";
import { toast } from "sonner";
import Link from "next/link";

interface ParentsTableProps {
  parents: any[];
  students: any[];
  onRefresh: () => void;
}

export function ParentsTable({ parents, students, onRefresh }: ParentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleDelete = async (parentId: string, parentName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le parent "${parentName}" ?`)) {
      try {
        const result = await deleteParent(parentId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Parent supprimé avec succès");
          onRefresh();
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <User className="mr-2 h-4 w-4" />
          Parent
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const parent = row.original;
        const name = parent.user?.name || "Non renseigné";
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-emerald-100">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">Parent d'élève</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user.email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const email = row.original.user?.email;
        return email ? (
          <span className="text-gray-600 dark:text-gray-300">{email}</span>
        ) : (
          <span className="text-gray-400 italic">Non renseigné</span>
        );
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <Phone className="mr-2 h-4 w-4" />
          Téléphone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return phone ? (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-emerald-600" />
            <span className="text-gray-600 dark:text-gray-300">{phone}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">Non renseigné</span>
        );
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Adresse
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        return address ? (
          <div className="flex items-center space-x-2 max-w-xs">
            <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate" title={address}>
              {address}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 italic">Non renseignée</span>
        );
      },
    },
    {
      id: "children",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <Heart className="mr-2 h-4 w-4" />
          Enfants
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const parent = row.original;
        const childrenCount = parent.children?.length || 0;
        return (
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {childrenCount}
            </span>
            {childrenCount > 0 && (
              <span className="text-sm text-gray-500">
                enfant{childrenCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const countA = rowA.original.children?.length || 0;
        const countB = rowB.original.children?.length || 0;
        return countA - countB;
      },
    },
    {
      accessorKey: "user.isActive",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.original.user?.isActive;
        return (
          <Badge 
            variant={isActive ? "default" : "destructive"}
            className={isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}
          >
            {isActive ? "Actif" : "Inactif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const parent = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/parents/${parent.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/parents/${parent.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(parent.id, parent.user?.name || "ce parent")}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: parents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full space-y-6">
      {/* Barre de recherche et actions */}
      <div className="flex items-center justify-between space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un parent..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-900 dark:text-gray-100">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucun parent trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hover:bg-gray-50"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="hover:bg-gray-50"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

