"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface MembersTableProps {
  members: any[];
  memberType: string;
}

export function MembersTable({ members, memberType }: MembersTableProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      case "parent":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "user.name",
      accessorFn: (row: any) => row?.user?.name ?? "",
      header: "Nom",
      cell: ({ getValue }) => <div className="font-medium">{getValue<string>()}</div>,
    },
    {
      id: "user.email",
      accessorFn: (row: any) => row?.user?.email ?? "",
      header: "Email",
      cell: ({ getValue }) => <div className="text-muted-foreground">{getValue<string>()}</div>,
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge className={getRoleBadgeColor(role)}>
            {role === "ADMIN" ? "Administrateur" :
             role === "TEACHER" ? "Enseignant" :
             role === "STUDENT" ? "Élève" :
             role === "PARENT" ? "Parent" : role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "user.isActive",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.original.user.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Actif" : "Inactif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Navigate to member detail
                  console.log("Voir détails de", member.user.name);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Edit member
                  console.log("Modifier", member.user.name);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  // TODO: Remove member from school
                  console.log("Retirer", member.user.name);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Retirer de l'école
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-2">
            Aucun {memberType === "admin" ? "administrateur" :
                    memberType === "teacher" ? "enseignant" :
                    memberType === "student" ? "élève" : "parent"} trouvé
          </div>
          <p className="text-sm text-muted-foreground">
            Utilisez le bouton "Ajouter" pour ajouter des membres à cette école.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={members}
          searchKey="user.name"
          searchPlaceholder={`Rechercher ${memberType === "admin" ? "un administrateur" :
                                           memberType === "teacher" ? "un enseignant" :
                                           memberType === "student" ? "un élève" : "un parent"}...`}
        />
      )}
    </div>
  );
}
