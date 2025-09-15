"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { type NavigationGroup } from "@/settings/schoolNavigation";
import { useNavigation } from "@/hooks/useNavigation";

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function ModernSidebar({ isOpen, onToggle }: ModernSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Utiliser le hook de navigation avec gestion des rôles
  const { navigation, userRole, isLoading } = useNavigation();

  

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle expanded state for items with children
  const toggleExpanded = (itemPath: string) => {
    setExpandedItems(prev => 
      prev.includes(itemPath) 
        ? prev.filter(path => path !== itemPath)
        : [...prev, itemPath]
    );
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={collapsed ? { width: "5rem" } : { width: "16rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg"
      >
        <SidebarContent 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          pathname={pathname}
          navigation={navigation}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
        />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl lg:hidden"
          >
            <SidebarContent 
              collapsed={false}
              onCollapse={() => {}}
              pathname={pathname}
              navigation={navigation}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              onItemClick={() => onToggle(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  pathname: string;
  navigation: NavigationGroup[];
  expandedItems: string[];
  toggleExpanded: (itemPath: string) => void;
  onItemClick?: () => void;
}

function SidebarContent({ collapsed, onCollapse, pathname, navigation, expandedItems, toggleExpanded, onItemClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">
                Mon École
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex w-8 h-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((group: NavigationGroup, groupIndex: number) => (
            <div key={group.title}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {group.title}
                  </motion.h3>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {group.items.map((item: any, itemIndex: number) => {
                  const isActive = pathname === item.path;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems.includes(item.path);
                  const hasActiveChild = hasChildren && item.children?.some((child: any) => pathname === child.path);
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: (groupIndex * 0.1) + (itemIndex * 0.05) 
                      }}
                    >
                      {/* Parent item */}
                      <div
                        className={cn(
                          "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative cursor-pointer",
                          isActive || hasActiveChild
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        )}
                        onClick={() => {
                          if (hasChildren) {
                            toggleExpanded(item.path);
                          } else {
                            onItemClick?.();
                          }
                        }}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-5 h-5 mr-3 transition-colors",
                          isActive || hasActiveChild
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center justify-between flex-1 min-w-0"
                            >
                              <div className="flex-1 min-w-0">
                                {hasChildren ? (
                                  <span className="truncate">{item.title}</span>
                                ) : (
                                  <Link 
                                    href={item.path}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onItemClick?.();
                                    }}
                                    className="truncate block"
                                  >
                                    {item.title}
                                  </Link>
                                )}
                                {item.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge.variant || "secondary"}
                                    className={cn(
                                      "text-xs",
                                      item.badge.variant === "destructive" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    )}
                                  >
                                    {item.badge.text}
                                  </Badge>
                                )}
                                
                                {hasChildren && (
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRightIcon className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Active indicator */}
                        {(isActive || hasActiveChild) && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </div>

                      {/* Children items */}
                      <AnimatePresence>
                        {hasChildren && isExpanded && !collapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3"
                          >
                            {item.children?.map((child: any, childIndex: number) => {
                              const isChildActive = pathname === child.path;
                              
                              return (
                                <motion.div
                                  key={child.path}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: childIndex * 0.05 }}
                                >
                                  <Link
                                    href={child.path}
                                    onClick={onItemClick}
                                    className={cn(
                                      "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 group relative",
                                      isChildActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                  >
                                    {child.icon && (
                                      <child.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{child.title}</span>
                                    
                                    {child.badge && (
                                      <Badge 
                                        variant={child.badge.variant || "secondary"}
                                        className="ml-auto text-xs"
                                      >
                                        {child.badge.text}
                                      </Badge>
                                    )}
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
