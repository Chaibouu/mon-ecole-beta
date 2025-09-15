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
import { listStudentsWithClassrooms, listClassrooms } from "@/actions/school-members";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Heart, Users } from "lucide-react";
import dynamic from "next/dynamic";

// Import react-select dynamically to avoid SSR issues
const Select = dynamic(() => import('react-select'), { ssr: false });

// Schémas pour le formulaire parent
const ParentCreateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z
    .string()
    .regex(/^\+227[0-9]{8}$/, { message: "Le numéro doit être au format +227XXXXXXXX" }),
  address: z.string().optional(),
  profession: z.string().optional(),
  workplace: z.string().optional(),
  preferredLanguage: z.string().optional(),
  children: z.array(z.string()).optional(),
}).refine((data) => {
  // Le téléphone est obligatoire, mais l'email est optionnel
  // Si email fourni, il doit être valide
  if (data.email && data.email !== "") {
    return z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Adresse email invalide",
  path: ["email"]
});

const ParentEditSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+227[0-9]{8}$/, { message: "Le numéro doit être au format +227XXXXXXXX" }),
  address: z.string().optional(),
  profession: z.string().optional(),
  workplace: z.string().optional(),
  preferredLanguage: z.string().optional(),
  children: z.array(z.string()).optional(),
}).refine((data) => {
  // Le téléphone est obligatoire, mais l'email est optionnel
  // Si email fourni, il doit être valide
  if (data.email && data.email !== "") {
    return z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Adresse email invalide",
  path: ["email"]
});

type ParentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
  students?: any[];
  onSuccess?: () => void;
};

export function ParentForm({ mode, initialData, parentId, onSuccess }: ParentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  
  const form = useForm<z.infer<typeof ParentCreateSchema> | z.infer<typeof ParentEditSchema>>({
    resolver: zodResolver(mode === "create" ? ParentCreateSchema : ParentEditSchema),
    defaultValues: mode === "edit" ? {
      name: initialData?.user?.name ?? "",
      email: initialData?.user?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      profession: initialData?.profession ?? "",
      workplace: initialData?.workplace ?? "",
      preferredLanguage: initialData?.preferredLanguage ?? "",
      children: initialData?.children?.map((link: any) => link.studentProfileId) ?? [],
    } : {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      profession: "",
      workplace: "",
      preferredLanguage: "",
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

  // Charger les classes et les étudiants avec leurs classes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [classroomsResult, studentsResult] = await Promise.all([
          listClassrooms(),
          listStudentsWithClassrooms()
        ]);

        if (classroomsResult?.error) {
          console.error("Erreur lors du chargement des classes:", classroomsResult.error);
        } else {
          setClassrooms(classroomsResult?.classrooms || []);
        }

        if (studentsResult?.error) {
          console.error("Erreur lors du chargement des étudiants:", studentsResult.error);
        } else {
          const studentsData = studentsResult?.students || [];
          setStudents(studentsData);
          setFilteredStudents(studentsData); // Initialement, tous les étudiants
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadData();
  }, []);

  // Filtrer les étudiants par classe sélectionnée
  useEffect(() => {
    if (selectedClassroom) {
      const filtered = students.filter(student => 
        student.currentClassroom?.id === selectedClassroom
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [selectedClassroom, students]);

  // Filtrer les étudiants qui n'ont pas encore de parent (sauf si on est en mode édition pour ce parent)
  const availableStudents = filteredStudents.filter(student => {
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
    label: `${student.user?.name || 'Nom non disponible'}${student.studentNumber ? ` (#${student.studentNumber})` : ''}${student.currentClassroom ? ` - ${student.currentClassroom.name}` : ''}`,
  }));

  const handleChildrenChange = (selectedOptions: any) => {
    const childrenIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setSelectedChildren(childrenIds);
    form.setValue('children', childrenIds);
  };

  async function onSubmit(values: any) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        // Pour la création, on utilise le format attendu par l'action
        const payload = {
          user: {
            name: values.name,
            email: values.email || undefined,
            password: values.password,
            phone: values.phone || undefined, // Convertir chaîne vide en undefined
          },
          phone: values.phone || undefined, // Dupliquer pour le profil parent
          address: values.address || undefined,
          profession: values.profession || undefined,
          workplace: values.workplace || undefined,
          preferredLanguage: values.preferredLanguage || undefined,
          children: selectedChildren.length > 0 ? selectedChildren.map(studentId => ({ 
            studentId, 
            relationship: "parent" 
          })) : undefined,
        };
        console.log("[PARENT_FORM] Payload envoyé:", payload);
        result = await createParent(payload);
        console.log("[PARENT_FORM] Résultat API:", result);
      } else if (parentId) {
        // Pour la mise à jour
        const payload = {
          name: values.name,
          email: values.email || undefined,
          profile: {
            phone: values.phone || undefined,
            address: values.address || undefined,
            profession: values.profession || undefined,
            workplace: values.workplace || undefined,
            preferredLanguage: values.preferredLanguage || undefined,
          },
          children: selectedChildren.length > 0 ? selectedChildren.map(studentId => ({ 
            studentId, 
            relationship: "parent" 
          })) : [],
        };
        console.log("[PARENT_FORM] Payload modification:", payload);
        result = await updateParent(parentId, payload);
        console.log("[PARENT_FORM] Résultat modification:", result);
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
                        placeholder="Ex: Aïcha Ali" 
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
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="aicha.ali@email.com" 
                        className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
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
              
              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Mot de passe *</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Minimum 6 caractères" 
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Numéro de téléphone *</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: +227 90 65 33 12" 
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
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
                      placeholder="Ex: Quartier Wadata, Rue de l'Université, Niamey, Niger"
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

        {/* Informations professionnelles et personnelles */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
            <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
              <span>Informations complémentaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Enseignant, Médecin, Commerçant" 
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de travail</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Ministère de l'Éducation, Hôpital National" 
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue préférée</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="francais">Français</option>
                        <option value="haoussa">Haoussa</option>
                        <option value="djerma">Djerma/Zarma</option>
                        <option value="tamasheq">Tamasheq</option>
                        <option value="fulfulde">Fulfulde</option>
                        <option value="arabe">Arabe</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              <div className="space-y-4">
                {/* Filtre par classe */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtrer par classe :
                  </label>
                  <Select
                    options={[
                      { value: "", label: "Toutes les classes" },
                      ...classrooms.map((classroom) => ({
                        value: classroom.id,
                        label: `${classroom.name} (${classroom.gradeLevel?.name || 'Niveau inconnu'})`,
                      })),
                    ]}
                    value={selectedClassroom ? 
                      { value: selectedClassroom, label: `${classrooms.find(c => c.id === selectedClassroom)?.name} (${classrooms.find(c => c.id === selectedClassroom)?.gradeLevel?.name || 'Niveau inconnu'})` } : 
                      { value: "", label: "Toutes les classes" }
                    }
                    onChange={(option: any) => {
                      // @ts-ignore
                      setSelectedClassroom(option ? option.value : "");
                    }}
                    placeholder="Sélectionner une classe..."
                    isClearable
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#10b981',
                        },
                      }),
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sélectionner les enfants :
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

