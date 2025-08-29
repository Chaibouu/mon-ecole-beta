"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import "./data-tables-css.css";
import "./satoshi.css";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { ModernSidebar } from "@/components/dashboard/ModernSidebar";
import { ModernHeader } from "@/components/dashboard/ModernHeader";
import { Loader } from "@/components/common/Loader";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Vérifier l'authentification après le montage du composant
    if (!isAuthenticated && !user) {
      router.push("/auth/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return <Loader />;
  }

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <ModernSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <ModernHeader onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-6 lg:px-8 lg:py-8"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

