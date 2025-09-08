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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createParent, updateParent } from "@/actions/parents";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Heart, Users } from "lucide-react";
import dynamic from "next/dynamic";

// Import react-select dynamically to avoid SSR issues
const Select = dynamic(() => import('react-select'), { ssr: false });

// Schema pour le formulaire parent
const ParentFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  children: z.array(z.string()).optional(),
});

type ParentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
  students?: any[];
  onSuccess?: () => void;
};

export function ParentForm({ mode, initialData, parentId, students = [], onSuccess }: ParentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof ParentFormSchema>>({
    resolver: zodResolver(ParentFormSchema),
    defaultValues: mode === "edit" ? {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      children: initialData?.children?.map((link: any) => link.studentProfileId) || [],
    } : {
      name: "",
      email: "",
      phone: "",
      address: "",
      children: [],
    },
  });

  // Initialiser les enfants sélectionnés pour l'édition
  useEffect(() => {
    if (mode === "edit" && initialData?.children) {
      const childrenIds = initialData.children.map((link: any) => link.studentProfileId);
      setSelectedChildren(childrenIds);
    }
  }, [mode, initialData]);

  // Filtrer les étudiants qui n'ont pas encore de parent (sauf si on est en mode édition pour ce parent)
  const availableStudents = students.filter(student => {
    // Si on est en mode édition, inclure les enfants déjà liés à ce parent
    if (mode === "edit" && initialData?.children) {
      const isCurrentChild = initialData.children.some((child: any) => child.studentProfileId === student.id);
      if (isCurrentChild) return true;
    }
    // Sinon, vérifier que l'étudiant n'a pas déjà de parent
    return !student.parentLinks || student.parentLinks.length === 0;
  });

  // Préparer les options pour react-select
  const studentOptions = availableStudents.map(student => ({
    value: student.id,
    label: `${student.user?.name || 'Nom non disponible'}${student.studentNumber ? ` (#${student.studentNumber})` : ''}`,
  }));

  const handleChildrenChange = (selectedOptions: any) => {
    const childrenIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedChildren(childrenIds);
    form.setValue('children', childrenIds);
  };

  async function onSubmit(values: z.infer<typeof ParentFormSchema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        // Pour la création, on utilise le format attendu par l'API
        const payload = {
          name: values.name,
          email: values.email,
          password: "Parent123!", // Mot de passe par défaut
          phone: values.phone,
          address: values.address,
          children: selectedChildren.length > 0 ? selectedChildren.map(studentId => ({ 
            studentId, 
            relationship: "parent" 
          })) : undefined,
        };
        result = await createParent(payload);
      } else if (parentId) {
        // Pour la mise à jour
        const payload = {
          name: values.name,
          email: values.email,
          profile: {
            phone: values.phone,
            address: values.address,
          },
        };
        result = await updateParent(parentId, payload);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Parent créé avec succès" : "Parent mis à jour avec succès");
        form.reset();
        setSelectedChildren([]);
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
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20">
            <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
              <Heart className="h-5 w-5" />
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
                        placeholder="Ex: Marie Dupont" 
                        className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
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
                        placeholder="marie.dupont@email.com" 
                        className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Numéro de téléphone</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: +33 6 12 34 56 78" 
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Adresse complète</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: 123 Rue de la Paix, 75001 Paris, France"
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section des enfants */}
        {students.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
              <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Users className="h-5 w-5" />
                <span>Enfants à lier (optionnel)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sélectionner les enfants
                </label>
                <Select
                  isMulti
                  options={studentOptions}
                  value={studentOptions.filter(option => selectedChildren.includes(option.value))}
                  onChange={handleChildrenChange}
                  placeholder="Choisir les enfants..."
                  noOptionsMessage={() => "Aucun élève disponible"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      borderColor: '#d1d5db',
                      '&:hover': {
                        borderColor: '#10b981',
                      },
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#dcfce7',
                      border: '1px solid #22c55e',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#166534',
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: '#166534',
                      '&:hover': {
                        backgroundColor: '#ef4444',
                        color: 'white',
                      },
                    }),
                  }}
                />
                <p className="text-xs text-gray-500">
                  {selectedChildren.length === 0 
                    ? "Aucun enfant sélectionné" 
                    : `${selectedChildren.length} enfant${selectedChildren.length > 1 ? 's' : ''} sélectionné${selectedChildren.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          >
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer le parent" : "Mettre à jour"}
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

