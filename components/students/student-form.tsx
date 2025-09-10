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
import { createStudent, updateStudent } from "@/actions/school-members";
import { useState } from "react";
import { User, Mail, Phone, Calendar, Hash, UserCheck } from "lucide-react";

// Schema simplifié pour la création d'élève
const StudentFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z
    .string()
    .regex(/^\+227[0-9]{8}$/, { message: "Le numéro doit être au format +227XXXXXXXX" })
    .optional(),
  matricule: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
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
      gender: initialData?.gender || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
    } : {
      name: "",
      email: "",
      phone: "",
      matricule: "",
      gender: "",
      dateOfBirth: "",
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
            email: values.email,
            password: "password123", // Mot de passe par défaut
          },
          profile: {
            matricule: values.matricule,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth,
          }
        };
        result = await createStudent(payload);
      } else if (studentId) {
        // Pour la mise à jour
        const payload = {
          name: values.name,
          email: values.email,
          profile: {
            matricule: values.matricule,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth,
          }
        };
        result = await updateStudent(studentId, payload);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Élève créé avec succès" : "Élève mis à jour avec succès");
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
                      <span>Email *</span>
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
                      <span>Téléphone</span>
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
                  </FormItem>
                )}
              />
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
  );
}

