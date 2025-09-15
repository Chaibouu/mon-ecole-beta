"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  const defaultIcon = <FileX className="w-12 h-12" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center justify-center py-12", className)}
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="text-center space-y-6 p-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500">
              {icon || defaultIcon}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
              {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              {description}
            </p>
          </motion.div>

          {action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={action.onClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SearchEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={<Search className="w-12 h-12" />}
      title="Aucun résultat trouvé"
      description={`Aucun élément ne correspond à votre recherche "${searchTerm}". Essayez avec d'autres mots-clés.`}
    />
  );
}
