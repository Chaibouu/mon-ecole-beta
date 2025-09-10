"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSchoolAdmin, createSchoolTeacher, createSchoolParent, createSchoolStudent, getAvailableUsers } from "@/actions/school-members";

const NewUserSchema = z.object({
  type: z.literal("new"),
  user: z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z
      .string()
      .regex(/^\+227[0-9]{8}$/, { message: "Le numéro doit être au format +227XXXXXXXX" })
      .optional(),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  }),
});

const ExistingUserSchema = z.object({
  type: z.literal("existing"),
  existingUserId: z.string().min(1, "Veuillez sélectionner un utilisateur"),
});

const MemberFormSchema = z.discriminatedUnion("type", [NewUserSchema, ExistingUserSchema]);

interface MemberFormProps {
  schoolId: string;
  memberType: "admin" | "teacher" | "parent" | "student";
  onSuccess: (member: any) => void;
  onCancel: () => void;
}

export function MemberForm({ schoolId, memberType, onSuccess, onCancel }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userType, setUserType] = useState<"new" | "existing">("new");

  const form = useForm<z.infer<typeof MemberFormSchema>>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: {
      type: "new",
      user: {
        name: "",
        email: "",
        phone: "",
        password: "",
      },
    },
  });

  useEffect(() => {
    const loadUsers = async () => {
      const result = await getAvailableUsers();
      if (result?.users) {
        setAvailableUsers(result.users);
      }
    };
    loadUsers();
  }, []);

  const onSubmit = async (data: z.infer<typeof MemberFormSchema>) => {
    setLoading(true);
    try {
      let result;
      const payload = data.type === "new" ? { user: data.user } : { existingUserId: data.existingUserId };

      switch (memberType) {
        case "admin":
          result = await createSchoolAdmin(schoolId, payload);
          break;
        case "teacher":
          result = await createSchoolTeacher(schoolId, payload);
          break;
        case "parent":
          result = await createSchoolParent(schoolId, payload);
          break;
        case "student":
          result = await createSchoolStudent(schoolId, payload);
          break;
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${memberType === "admin" ? "Administrateur" : 
                       memberType === "teacher" ? "Enseignant" :
                       memberType === "student" ? "Élève" : "Parent"} ajouté avec succès`);
        // Mise à jour optimiste de la table avant refresh
        const optimistic = {
          role: (memberType === "admin" ? "ADMIN" : memberType === "teacher" ? "TEACHER" : memberType === "student" ? "STUDENT" : "PARENT"),
          user: (data as any).type === "new"
            ? { name: (data as any).user.name, email: (data as any).user.email, isActive: true }
            : (availableUsers.find(u => u.id === (data as any).existingUserId) || { name: "Utilisateur", email: "", isActive: true }),
        } as any;
        onSuccess(result?.userSchool ? result : { userSchool: optimistic });
        router.refresh();
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle User Type */}
      <div className="flex space-x-4">
        <Button
          type="button"
          variant={userType === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUserType("new");
            form.setValue("type", "new");
          }}
        >
          Créer un nouvel utilisateur
        </Button>
        <Button
          type="button"
          variant={userType === "existing" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setUserType("existing");
            form.setValue("type", "existing");
          }}
        >
          Lier un utilisateur existant
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {userType === "new" ? (
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="user.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jean.dupont@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+227XXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe temporaire *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="existingUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sélectionner un utilisateur *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un utilisateur..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
