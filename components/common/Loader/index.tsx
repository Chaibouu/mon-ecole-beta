"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const Loader = ({ size = "md", className, text, fullScreen = true }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-6"
        >
          {/* Logo animé */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>

          {/* Texte de chargement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Mon École
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {text || "Chargement en cours..."}
            </p>
          </motion.div>

          {/* Barre de progression */}
          <motion.div
            className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Version compacte pour utilisation dans les composants
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={cn(
            "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg",
            sizeClasses[size]
          )}
        >
          <GraduationCap className={cn("text-white", iconSizes[size])} />
        </motion.div>
        
        {text && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-600 dark:text-slate-300 text-center"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export { Loader };