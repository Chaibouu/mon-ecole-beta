"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, MoreHorizontal, BookOpen, Mail, Phone, Pencil, Star, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateTeacher } from "@/actions/teachers";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

type Teacher = {
  id: string;
  user: { name: string; email: string; image?: string; phone?: string };
  bio?: string;
  status?: string;
  subjects?: Array<{ id: string; name: string }>;
  assignments: Array<{
    subject: { id: string; name: string };
    classroom: { name: string };
    academicYear: { name: string };
  }>;
};

export function TeachersTable({ teachers, onRefresh }: { teachers: Teacher[]; onRefresh?: () => void }) {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const handleUpdateTeacher = async (teacherId: string, data: Record<string, any>) => {
    try {
      const result: any = await updateTeacher(teacherId, data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Professeur mis à jour avec succès");
        setEditingTeacher(null);
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      id: "name",
      accessorFn: (row) => row.user?.name || "",
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
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={teacher.user.image || ""} />
              <AvatarFallback className="text-sm font-medium">
                {teacher.user.name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{teacher.user.name}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{teacher.user.email}</span>
              </div>
              {teacher.user.phone && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{teacher.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "assignments",
      header: "Matières enseignées",
      cell: ({ row }) => {
        const subjectsList = Array.isArray(row.original.subjects) ? row.original.subjects : [];
        if (!subjectsList.length) {
          return <span className="text-muted-foreground text-sm">Aucune matière</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {subjectsList.slice(0, 4).map((s) => (
              <Badge
                key={s.id}
                variant={"secondary"}
                className="text-xs flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                {s.name}
              </Badge>
            ))}
            {subjectsList.length > 4 && (
              <Badge variant="outline" className="text-xs">+{subjectsList.length - 4}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = (row.original as any).status;
        if (!status) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        
        const statusConfig = {
          ACTIVE: { label: "Actif", variant: "default" as const },
          INACTIVE: { label: "Inactif", variant: "secondary" as const },
          TERMINATED: { label: "Terminé", variant: "destructive" as const },
          ON_LEAVE: { label: "En congé", variant: "outline" as const },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
        
        return (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const teacher = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/teachers/${teacher.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/teachers/${teacher.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/teachers/${teacher.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir les détails
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/teachers/${teacher.id}/edit`} className="flex items-center">
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={teachers}
      searchKey="name"
      searchPlaceholder="Rechercher un professeur..."
    />
  );
}

