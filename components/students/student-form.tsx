"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStudent, updateStudent } from "@/actions/students";
import { useState } from "react";
import { User, Mail, Phone, Calendar, Hash, UserCheck, MapPin, Flag, Droplets, Home, AlertTriangle, School, Activity, Lock } from "lucide-react";

// Schema pour la création d'élève avec nouveaux champs
const StudentFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+227[0-9]{8}$/, { message: "Le numéro doit être au format +227XXXXXXXX" }),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
  matricule: z.string().optional(),
  studentNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  bloodType: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  previousSchool: z.string().optional(),
  status: z.string().optional(),
}).refine((data) => {
  // Le téléphone est obligatoire, l'email est optionnel
  // Si email fourni, il doit être valide
  if (data.email && data.email !== "") {
    return z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Adresse email invalide",
  path: ["email"]
});

type StudentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  studentId?: string;
  onSuccess?: () => void;
};

export function StudentForm({ mode, initialData, studentId, onSuccess }: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof StudentFormSchema>>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: mode === "edit" ? {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      phone: initialData?.user?.phone || "",
      matricule: initialData?.matricule || "",
      studentNumber: initialData?.studentNumber || "",
      gender: initialData?.gender || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      placeOfBirth: initialData?.placeOfBirth || "",
      nationality: initialData?.nationality || "",
      bloodType: initialData?.bloodType || "",
      address: initialData?.address || "",
      emergencyContact: initialData?.emergencyContact || "",
      emergencyPhone: initialData?.emergencyPhone || "",
      previousSchool: initialData?.previousSchool || "",
      status: initialData?.status || "ACTIVE",
    } : {
      name: "",
      email: "",
      phone: "",
      password: "",
      matricule: "",
      studentNumber: "",
      gender: "",
      dateOfBirth: "",
      placeOfBirth: "",
      nationality: "",
      bloodType: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      previousSchool: "",
      status: "ACTIVE",
    },
  });

  async function onSubmit(values: z.infer<typeof StudentFormSchema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        // Pour la création, on utilise le format attendu par l'API
        const payload = {
          user: {
            name: values.name,
            email: values.email || undefined,
            phone: values.phone,
            password: values.password || "password123", // Mot de passe fourni ou par défaut
          },
          profile: {
            matricule: values.matricule,
            studentNumber: values.studentNumber,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth,
            placeOfBirth: values.placeOfBirth,
            nationality: values.nationality,
            bloodType: values.bloodType,
            address: values.address,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            previousSchool: values.previousSchool,
            status: values.status || "ACTIVE",
          }
        };
        result = await createStudent(payload);
      } else if (studentId) {
        // Pour la mise à jour
        const payload = {
          name: values.name,
          email: values.email || undefined,
          phone: values.phone,
          profile: {
            matricule: values.matricule,
            studentNumber: values.studentNumber,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth,
            placeOfBirth: values.placeOfBirth,
            nationality: values.nationality,
            bloodType: values.bloodType,
            address: values.address,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            previousSchool: values.previousSchool,
            status: values.status,
          }
        };
        result = await updateStudent(studentId, payload);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Élève créé avec succès" : "Élève mis à jour avec succès");
        form.reset();
        
        if (onSuccess) {
          onSuccess();
        } else if (mode === "edit" && studentId) {
          // Redirection automatique après édition si onSuccess n'est pas fourni
          window.location.href = `/students/${studentId}`;
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations personnelles */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nom complet *</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Jean Dupont" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="jean.dupont@email.com" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Optionnel. Si fourni, doit être un email valide
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone *</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+227XXXXXXXX" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Obligatoire. Format nigérien requis: +227XXXXXXXX
                    </p>
                  </FormItem>
                )}
              />

              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Mot de passe</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Mot de passe pour l'élève" 
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        Optionnel. Si non fourni, un mot de passe par défaut sera utilisé
                      </p>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>Matricule</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: ETU2024001" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
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
                    <FormLabel className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>Genre</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Masculin</SelectItem>
                        <SelectItem value="FEMALE">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date de naissance</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nouveaux champs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>Numéro d'étudiant</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: ETU2024001" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Lieu de naissance</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Niamey, Niger" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
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
                    <FormLabel className="flex items-center space-x-2">
                      <Flag className="h-4 w-4" />
                      <span>Nationalité</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Nigérienne" 
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4" />
                      <span>Groupe sanguin</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Adresse</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Quartier Wadata, Rue de l'Université, Niamey" 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informations d'urgence et scolaire */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <AlertTriangle className="h-5 w-5" />
              <span>Informations d'urgence et scolaire</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Contact d'urgence</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Maman Ali" 
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500" 
                        {...field} 
                      />
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
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone d'urgence</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: +227 90 65 33 12" 
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="previousSchool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <School className="h-4 w-4" />
                      <span>École précédente</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: École Primaire de Niamey" 
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Statut</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                        <SelectItem value="INACTIVE">Inactif</SelectItem>
                        <SelectItem value="GRADUATED">Diplômé</SelectItem>
                        <SelectItem value="TRANSFERRED">Transféré</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'élève" : "Mettre à jour"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            className="border-gray-300 hover:bg-gray-50"
          >
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}

