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
  Calendar,
  RefreshCw,
  CreditCard,
  Trash
} from "lucide-react";
import { deleteStudent } from "@/actions/school-members";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

interface StudentsTableProps {
  students: any[];
  onRefresh: () => void;
}

export function StudentsTable({ students, onRefresh }: StudentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleDelete = async (studentId: string, studentName: string) => {

      try {
        const result = await deleteStudent(studentId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Élève supprimé avec succès");
          onRefresh();
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          <User className="mr-2 h-4 w-4" />
          Élève
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const student = row.original;
        const name = student.user?.name || "Non renseigné";
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
              {student.matricule && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Matricule: {student.matricule}
                </div>
              )}
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
          className="hover:bg-blue-50 dark:hover:bg-blue-950"
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
      accessorKey: "gender",
      header: "Genre",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        if (!gender) return <span className="text-gray-400 italic">Non renseigné</span>;
        
        return (
          <Badge variant={gender === "MALE" ? "default" : "secondary"} className="capitalize">
            {gender === "MALE" ? "Masculin" : gender === "FEMALE" ? "Féminin" : gender}
          </Badge>
        );
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Date de naissance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("dateOfBirth") as string;
        if (!date) return <span className="text-gray-400 italic">Non renseignée</span>;
        
        const formattedDate = new Date(date).toLocaleDateString("fr-FR");
        const age = Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        return (
          <div>
            <div className="font-medium">{formattedDate}</div>
            <div className="text-sm text-gray-500">({age} ans)</div>
          </div>
        );
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
            className={isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
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
        const student = row.original;

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
                <Link href={`/students/${student.user?.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/students/${student.user?.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/students/${student.id}/payments`} className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Paiements
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
              >
                  <Dialog >
                                  <DialogTrigger asChild>
                                    <span className="flex"> <Trash className="mr-2 h-4 w-4" />Supprimer</span>
                                  </DialogTrigger>
                                  <DialogContent>
                
                                  <div className="text-sm">
                                    Êtes-vous sûr de vouloir supprimer l'élève "{student.user?.name}" ?
                                  </div>
                                  <div className="mt-4 flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDelete(student.id, student.user?.name)}
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

  const table = useReactTable({
    data: students,
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
            placeholder="Rechercher un élève..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors border-b border-gray-100 dark:border-gray-800"
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
                  Aucun élève trouvé.
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

