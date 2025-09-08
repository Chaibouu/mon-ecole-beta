"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  UserPlus, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { addChildToParent, removeChildFromParent, getParentChildrenByParentId } from "@/actions/parent-data";
import { listStudents } from "@/actions/school-members";

interface Parent {
  id: string;
  phone: string | null;
  address: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
  };
  children?: Array<{
    id: string;
    studentId: string;
    name: string | null;
    matricule: string | null;
    relationship: string | null;
    currentEnrollment: {
      classroom: {
        name: string;
        gradeLevel: {
          name: string;
        };
      };
    } | null;
  }>;
}

interface Student {
  id: string;
  matricule: string | null;
  user: {
    name: string | null;
  };
  enrollments: Array<{
    classroom: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
  }>;
}

interface AdminParentsTableWrapperProps {
  initialParents: Parent[];
}

export function AdminParentsTableWrapper({ initialParents }: AdminParentsTableWrapperProps) {
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isChildrenDialogOpen, setIsChildrenDialogOpen] = useState(false);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [loading, setLoading] = useState(false);

  const handleViewChildren = async (parent: Parent) => {
    try {
      setLoading(true);
      setSelectedParent(parent);

      // Récupérer les enfants du parent
      const childrenResult = await getParentChildrenByParentId(parent.id);
      if (childrenResult?.error) {
        toast.error(childrenResult.error);
        return;
      }

      // Mettre à jour les données du parent avec ses enfants
      const updatedParent = { ...parent, children: childrenResult.children || [] };
      setSelectedParent(updatedParent);
      setIsChildrenDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des enfants");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddChild = async () => {
    try {
      setLoading(true);
      
      // Récupérer la liste des étudiants
      const studentsResult = await listStudents();
      if (studentsResult?.error) {
        toast.error(studentsResult.error);
        return;
      }

      setStudents(studentsResult.students || []);
      setIsAddChildDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des étudiants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!selectedParent || !selectedStudentId || !relationship) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      const result = await addChildToParent(selectedParent.id, {
        studentId: selectedStudentId,
        relationship,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Enfant ajouté avec succès");
      
      // Recharger les enfants du parent
      const childrenResult = await getParentChildrenByParentId(selectedParent.id);
      if (!childrenResult?.error) {
        const updatedParent = { ...selectedParent, children: childrenResult.children || [] };
        setSelectedParent(updatedParent);
      }

      // Réinitialiser le formulaire
      setSelectedStudentId("");
      setRelationship("");
      setIsAddChildDialogOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'enfant");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChild = async (linkId: string) => {
    if (!selectedParent) return;

    try {
      setLoading(true);

      const result = await removeChildFromParent(selectedParent.id, linkId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Liaison supprimée avec succès");
      
      // Recharger les enfants du parent
      const childrenResult = await getParentChildrenByParentId(selectedParent.id);
      if (!childrenResult?.error) {
        const updatedParent = { ...selectedParent, children: childrenResult.children || [] };
        setSelectedParent(updatedParent);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de la liaison");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les étudiants déjà liés à ce parent
  const availableStudents = students.filter(student => 
    !selectedParent?.children?.some(child => child.studentId === student.id)
  );

  return (
    <div className="space-y-4">
      {/* Liste des parents */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parents.map((parent) => (
          <Card key={parent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    {parent.user.name || "Nom non défini"}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {parent.user.email}
                    </div>
                    {parent.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {parent.phone}
                      </div>
                    )}
                    {parent.address && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {parent.address}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant={parent.user.isActive ? "default" : "secondary"}>
                    {parent.user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewChildren(parent)}
                  disabled={loading}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Enfants
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog pour voir/gérer les enfants */}
      <Dialog open={isChildrenDialogOpen} onOpenChange={setIsChildrenDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enfants de {selectedParent?.user.name}
            </DialogTitle>
            <DialogDescription>
              Gérez les liaisons entre ce parent et ses enfants
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bouton pour ajouter un enfant */}
            <div className="flex justify-end">
              <Button onClick={handleOpenAddChild} disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un enfant
              </Button>
            </div>

            {/* Liste des enfants */}
            {selectedParent?.children && selectedParent.children.length > 0 ? (
              <div className="grid gap-3">
                {selectedParent.children.map((child) => (
                  <Card key={child.id} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-blue-900">
                              {child.name || "Nom non défini"}
                            </h4>
                            <Badge variant="outline">{child.relationship}</Badge>
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            <p>Matricule: {child.matricule || "Non défini"}</p>
                            {child.currentEnrollment && (
                              <p>
                                Classe: {child.currentEnrollment.classroom.gradeLevel.name} - {child.currentEnrollment.classroom.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveChild(child.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun enfant lié à ce parent</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilisez le bouton "Ajouter un enfant" pour créer des liaisons.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un enfant */}
      <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un enfant</DialogTitle>
            <DialogDescription>
              Créez une liaison entre {selectedParent?.user.name} et un étudiant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Étudiant</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un étudiant" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.user.name} - {student.matricule} 
                      {student.enrollments[0] && (
                        <span className="text-muted-foreground ml-2">
                          ({student.enrollments[0].classroom.gradeLevel.name})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relation</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="père">Père</SelectItem>
                  <SelectItem value="mère">Mère</SelectItem>
                  <SelectItem value="tuteur">Tuteur</SelectItem>
                  <SelectItem value="tutrice">Tutrice</SelectItem>
                  <SelectItem value="grand-père">Grand-père</SelectItem>
                  <SelectItem value="grand-mère">Grand-mère</SelectItem>
                  <SelectItem value="oncle">Oncle</SelectItem>
                  <SelectItem value="tante">Tante</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddChild} 
                disabled={loading || !selectedStudentId || !relationship}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddChildDialogOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
