"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Save,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { listStudents } from "@/actions/school-members";
import { createParentWithChildren } from "@/actions/parent-data";
import { useRouter } from "next/navigation";

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

interface ChildLink {
  studentId: string;
  relationship: string;
  studentName?: string;
  studentMatricule?: string;
  studentClass?: string;
}

export function CreateParentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [childrenLinks, setChildrenLinks] = useState<ChildLink[]>([]);
  const [newChildStudentId, setNewChildStudentId] = useState("");
  const [newChildRelationship, setNewChildRelationship] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const result = await listStudents();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setStudents(result.students || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des étudiants");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddChild = () => {
    if (!newChildStudentId || !newChildRelationship) {
      toast.error("Veuillez sélectionner un étudiant et une relation");
      return;
    }

    // Vérifier si l'étudiant n'est pas déjà ajouté
    if (childrenLinks.some(link => link.studentId === newChildStudentId)) {
      toast.error("Cet étudiant est déjà lié à ce parent");
      return;
    }

    const student = students.find(s => s.id === newChildStudentId);
    if (!student) return;

    const newLink: ChildLink = {
      studentId: newChildStudentId,
      relationship: newChildRelationship,
      studentName: student.user.name || "Nom non défini",
      studentMatricule: student.matricule || "Non défini",
      studentClass: student.enrollments[0]?.classroom.gradeLevel.name || "Non défini",
    };

    setChildrenLinks(prev => [...prev, newLink]);
    setNewChildStudentId("");
    setNewChildRelationship("");
  };

  const handleRemoveChild = (studentId: string) => {
    setChildrenLinks(prev => prev.filter(link => link.studentId !== studentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);

      const result = await createParentWithChildren({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        children: childrenLinks.map(link => ({
          studentId: link.studentId,
          relationship: link.relationship,
        })),
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message || "Parent créé avec succès !");
      router.push("/admin/parents");
    } catch (error) {
      toast.error("Erreur lors de la création du parent");
    } finally {
      setLoading(false);
    }
  };

  const availableStudents = students.filter(student => 
    !childrenLinks.some(link => link.studentId === student.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations du parent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations du parent
          </CardTitle>
          <CardDescription>
            Saisissez les informations personnelles du parent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nom et prénom du parent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemple.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Au moins 6 caractères"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Répétez le mot de passe"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Adresse complète du parent"
                  className="pl-10"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liaison avec les enfants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enfants à lier
          </CardTitle>
          <CardDescription>
            Ajoutez les enfants qui seront liés à ce parent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulaire pour ajouter un enfant */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Étudiant</Label>
              <Select value={newChildStudentId} onValueChange={setNewChildStudentId}>
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
              <Label>Relation</Label>
              <Select value={newChildRelationship} onValueChange={setNewChildRelationship}>
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

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                type="button"
                onClick={handleAddChild}
                disabled={!newChildStudentId || !newChildRelationship}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Liste des enfants ajoutés */}
          {childrenLinks.length > 0 ? (
            <div className="space-y-2">
              <Label>Enfants liés ({childrenLinks.length})</Label>
              <div className="space-y-2">
                {childrenLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-900">{link.studentName}</span>
                        <Badge variant="outline">{link.relationship}</Badge>
                      </div>
                      <div className="text-sm text-blue-700">
                        Matricule: {link.studentMatricule} • Classe: {link.studentClass}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveChild(link.studentId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun enfant ajouté</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez créer le parent sans enfants et les lier plus tard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Création...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Créer le parent
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
