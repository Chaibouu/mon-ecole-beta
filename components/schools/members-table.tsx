"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import { updateSchoolAdmin, deleteSchoolAdmin } from "@/actions/school-members";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface MembersTableProps {
  members: any[];
  memberType: string;
  schoolId: string;
  onRefresh?: () => void;
}

export function MembersTable({ members, memberType, schoolId, onRefresh }: MembersTableProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true
  });

  const handleEdit = (member: any) => {
    if (memberType !== "admin") {
      toast.error("Modification non supportée pour ce type de membre");
      return;
    }

    setEditingMember(member);
    setEditForm({
      name: member.user.name || "",
      email: member.user.email || "",
      phone: member.user.phone || "",
      password: "",
      isActive: member.user.isActive || false
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    setIsLoading(true);
    try {
      const updateData: any = {};
      
      if (editForm.name !== editingMember.user.name) {
        updateData.name = editForm.name;
      }
      if (editForm.email !== editingMember.user.email) {
        updateData.email = editForm.email;
      }
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }
      if (editForm.isActive !== editingMember.user.isActive) {
        updateData.isActive = editForm.isActive;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("Aucune modification détectée");
        setEditingMember(null);
        return;
      }

      const result = await updateSchoolAdmin(schoolId, editingMember.user.id, updateData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Administrateur modifié avec succès");
        setEditingMember(null);
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (member: any) => {
    if (memberType !== "admin") {
      toast.error("Modification non supportée pour ce type de membre");
      return;
    }

    const newStatus = !member.user.isActive;
    
    setIsLoading(true);
    try {
      const result = await updateSchoolAdmin(schoolId, member.user.id, {
        isActive: newStatus
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Administrateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (member: any) => {
    if (memberType !== "admin") {
      toast.error("Suppression non supportée pour ce type de membre");
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir retirer ${member.user.name} de cette école ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteSchoolAdmin(schoolId, member.user.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Administrateur retiré avec succès");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };
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
                disabled={isLoading}
                onClick={() => handleEdit(member)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {memberType === "admin" && (
                <DropdownMenuItem
                  disabled={isLoading}
                  onClick={() => handleToggleStatus(member)}
                >
                  {member.user.isActive ? (
                    <>
                      <span className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <span className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                disabled={isLoading}
                onClick={() => handleDelete(member)}
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

      {/* Modal de modification */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'administrateur</DialogTitle>
          </DialogHeader>
          
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom complet</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="adresse@email.com"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+227XXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="edit-password">Nouveau mot de passe (optionnel)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Laisser vide pour conserver l'actuel"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="edit-active">Compte actif</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingMember(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
