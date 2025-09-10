"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,  
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import { Checkbox } from "@/components/ui/checkbox"



export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different provider!"
    : "";
  
  const router = useRouter(); // Pour rediriger l'utilisateur

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Pour basculer le mot de passe
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    // L'identifiant peut être soit un email soit un téléphone
    const identifier = values.email || "";
    
    const loginData = {
      email: identifier, // Le champ email contient soit un email soit un téléphone
      password: values.password,
      rememberMe: values.rememberMe,
    };

    startTransition(() => {
      login(loginData)
        .then((data) => {
          if (data?.error) {
            // form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            router.push(callbackUrl); // Redirection après succès
          }

          // if (data?.twoFactor) {
          //   setShowTwoFactor(true);
          // }
        })
        .catch(() => setError("Une erreur s'est produite"));
    });
  };

  return (
    <CardWrapper
      headerLabel="Bienvenue"
      backButtonLabel="Nouveau compte ?"
      backButtonHref="/auth/signup"
      showSocial
    >
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Email ou Téléphone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="votre.email@exemple.com ou +227XXXXXXXX"
                          type="text"
                          className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Mot de passe</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors pr-12"
                          />
                        </FormControl>
                        <div
                          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <Icon icon="mdi:eye-off" width={20} height={20} />
                          ) : (
                            <Icon icon="mdi:eye" width={20} height={20} />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-around my-2 pt-2">
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="px-0 font-normal hover:text-gray-400"
                        >
                          <Link href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Mot de passe oublié ?
                          </Link>
                        </Button>
                        {/* Checkbox Remember Me */}
                        <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-400">
                           <FormField
                              control={form.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none cursor-pointer">
                                    <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                                        Se souvenir de moi
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />  
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connexion...</span>
              </div>
            ) : (
              showTwoFactor ? "Confirmer" : "Se connecter"
            )}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
