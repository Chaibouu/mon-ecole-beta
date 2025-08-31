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
import { createParent, updateParent } from "@/actions/school-members";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Heart } from "lucide-react";

// Schema pour le formulaire parent
const ParentFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ParentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string;
  onSuccess?: () => void;
};

export function ParentForm({ mode, initialData, parentId, onSuccess }: ParentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof ParentFormSchema>>({
    resolver: zodResolver(ParentFormSchema),
    defaultValues: mode === "edit" ? {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
    } : {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof ParentFormSchema>) {
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
          }
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
          }
        };
        result = await updateParent(parentId, payload);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Parent créé avec succès" : "Parent mis à jour avec succès");
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

