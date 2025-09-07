"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Users,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ParentProfile {
  id: string;
  phone: string | null;
  address: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
  };
  children: Array<{
    id: string;
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

interface ParentProfileClientProps {
  initialData?: ParentProfile | null;
}

export function ParentProfileClient({ initialData }: ParentProfileClientProps) {
  const [profile, setProfile] = useState<ParentProfile | null>(initialData || null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.user.name || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Ici, vous feriez un appel API pour sauvegarder les modifications
      // Pour la démo, on simule une sauvegarde réussie
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (profile) {
        setProfile({
          ...profile,
          user: { ...profile.user, name: formData.name },
          phone: formData.phone,
          address: formData.address,
        });
      }

      setEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.user.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
    setEditing(false);
  };

  if (!profile) {
    toast.error("Profil non trouvé");
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Profil non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de contact et coordonnées
            </CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Votre nom complet"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{profile.user.name || "Non défini"}</p>
                  {profile.user.isActive && (
                    <Badge variant="secondary" className="text-xs">Actif</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{profile.user.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié ici
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              {editing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 77 000 00 00"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile.phone || "Non renseigné"}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              {editing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Votre adresse complète"
                  rows={3}
                />
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{profile.address || "Non renseignée"}</p>
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mes enfants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes enfants ({profile.children.length})
          </CardTitle>
          <CardDescription>
            Liste de vos enfants scolarisés dans l'établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile.children.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {profile.children.map((child) => (
                <Card key={child.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <p className="font-medium text-blue-900">{child.name || "Nom non défini"}</p>
                        </div>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p>Matricule: {child.matricule || "Non défini"}</p>
                          {child.currentEnrollment && (
                            <p>
                              Classe: {child.currentEnrollment.classroom.gradeLevel.name} - {child.currentEnrollment.classroom.name}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {child.relationship || "Relation non définie"}
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun enfant trouvé</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contactez l'administration pour vérifier les liaisons
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations du compte */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Statut et paramètres de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Statut du compte</Label>
              <div className="flex items-center gap-2">
                {profile.user.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Compte actif</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Compte inactif</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Badge variant="secondary">Parent</Badge>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Besoin d'aide ?</p>
                <p className="text-sm text-blue-700">
                  Pour modifier votre mot de passe ou d'autres paramètres de sécurité, 
                  contactez l'administration de l'établissement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
