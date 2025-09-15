"use client";

import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import { motion } from "framer-motion";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial
}: CardWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <CardHeader className="space-y-6 pb-8">
          <Header label={headerLabel} />
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {children}
        </CardContent>
        {showSocial && (
          <CardFooter className="px-8 pb-6">
            <Social />
          </CardFooter>
        )}
        <CardFooter className="px-8 pb-8">
          <BackButton
            label={backButtonLabel}
            href={backButtonHref}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};