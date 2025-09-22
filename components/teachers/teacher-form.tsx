"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Heart, Users, Briefcase, GraduationCap } from "lucide-react";
// Types pour le formulaire
type TeacherFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  bio?: string;
  employeeNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  bloodType?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hireDate?: string;
  qualification?: string;
  specialization?: string;
  experienceYears?: string;
  salary?: string;
  status?: string;
  subjectIds?: string[];
};

// Schéma simple pour le formulaire
const TeacherFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().min(1, "Le téléphone est requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  bio: z.string().optional(),
  employeeNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  bloodType: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  hireDate: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experienceYears: z.string().optional(),
  salary: z.string().optional(),
  status: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.email && data.email !== "") {
    return z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Adresse email invalide",
  path: ["email"]
});
import { createTeacher } from "@/actions/school-members";
import { updateTeacher as updateTeacherApi } from "@/actions/teachers";
import { listSubjects } from "@/actions/subjects";
import { useState, useEffect } from "react";

type TeacherFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  teacherId?: string;
  onSuccess?: () => void;
};

export function TeacherForm({ mode, initialData, teacherId, onSuccess }: TeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const subjects = Array.isArray((initialData as any)?.__subjects)
    ? (initialData as any).__subjects
    : [];
  
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(TeacherFormSchema),
    defaultValues: mode === "edit" ? {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: "",
      // Champs du profil enseignant
      bio: initialData?.bio || "",
      employeeNumber: initialData?.employeeNumber || "",
      gender: initialData?.gender || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      placeOfBirth: initialData?.placeOfBirth || "",
      nationality: initialData?.nationality || "",
      bloodType: initialData?.bloodType || "",
      address: initialData?.address || "",
      emergencyContact: initialData?.emergencyContact || "",
      emergencyPhone: initialData?.emergencyPhone || "",
      hireDate: initialData?.hireDate ? new Date(initialData.hireDate).toISOString().split('T')[0] : "",
      qualification: initialData?.qualification || "",
      specialization: initialData?.specialization || "",
      experienceYears: initialData?.experienceYears?.toString() || "",
      salary: initialData?.salary?.toString() || "",
      status: initialData?.status || "ACTIVE",
      subjectIds: Array.isArray(initialData?.subjectIds) ? initialData.subjectIds : [],
    } : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      // Champs du profil enseignant
      bio: "",
      employeeNumber: "",
      gender: "",
      dateOfBirth: "",
      placeOfBirth: "",
      nationality: "",
      bloodType: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      hireDate: "",
      qualification: "",
      specialization: "",
      experienceYears: "",
      salary: "",
      status: "ACTIVE",
      subjectIds: [],
    },
  });

  // subjects are passed from server via initialData.__subjects

  async function onSubmit(values: TeacherFormData) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        // Structure pour la création : passer directement les valeurs
        result = await createTeacher(values);
      } else if (teacherId) {
        result = await updateTeacherApi(teacherId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Enseignant créé avec succès" : "Enseignant mis à jour avec succès");
        form.reset();
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de famille *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subjectIds"
          render={() => (
            <FormItem>
              <FormLabel>Matières enseignées</FormLabel>
              <Controller
                name="subjectIds"
                control={form.control}
                render={({ field }) => {
                  const options: { value: string; label: string }[] = subjects.map((s: any) => ({ value: s.id, label: s.name }));
                  const selectedIds: string[] = Array.isArray(field.value) ? field.value : [];
                  const value = options.filter((o) => selectedIds.includes(o.value));
                  const ReactSelect = require("react-select").default;
                  return (
                    <ReactSelect
                      isMulti
                      options={options}
                      value={value}
                      onChange={(vals: any) => field.onChange((vals || []).map((v: any) => v.value))}
                      placeholder="Sélectionnez une ou plusieurs matières"
                    />
                  );
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone *</FormLabel>
                <FormControl>
                  <Input placeholder="+227 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mode === "create" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mot de passe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'embauche</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Primary subject removed per new model */}

        {/* Informations personnelles supplémentaires */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="employeeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'employé</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Homme</SelectItem>
                        <SelectItem value="FEMALE">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de naissance</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Niamey, Niger" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationalité</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nigérienne" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groupe sanguin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le groupe sanguin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                        <SelectItem value="INACTIVE">Inactif</SelectItem>
                        <SelectItem value="TERMINATED">Terminé</SelectItem>
                        <SelectItem value="ON_LEAVE">En congé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adresse complète..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact d'urgence */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
              <Heart className="h-5 w-5" />
              <span>Contact d'urgence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du contact d'urgence</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Marie Traoré" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone d'urgence</FormLabel>
                    <FormControl>
                      <Input placeholder="+227 98 76 54 32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <Briefcase className="h-5 w-5" />
              <span>Informations professionnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification/Diplôme</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Master en Mathématiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Algèbre, Géométrie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d'expérience</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salaire (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Biographie de l'enseignant..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer" : "Mettre à jour"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
  );
}

