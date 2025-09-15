"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Calendar,
  UserCheck,
  ClipboardList,
  Bell,
  ArrowRight,
  Plus,
  BookOpenCheck,
  Building
} from "lucide-react";
import Link from "next/link";
import { DashboardStats, Activity } from "@/actions/dashboard-stats";

interface DashboardContentProps {
  user: any;
  selectedSchool: any;
  stats: DashboardStats;
}

const quickActions = [
  {
    title: "Nouvel étudiant",
    description: "Ajouter un nouvel étudiant",
    href: "/students/create",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    title: "Nouvelle classe",
    description: "Créer une nouvelle classe",
    href: "/classrooms/create", 
    icon: <GraduationCap className="w-5 h-5" />,
    color: "bg-green-500"
  },
  {
    title: "Nouvelle évaluation",
    description: "Programmer une évaluation",
    href: "/assessments/create",
    icon: <ClipboardList className="w-5 h-5" />,
    color: "bg-purple-500"
  },
  {
    title: "Emploi du temps",
    description: "Gérer les horaires",
    href: "/timetable-entries",
    icon: <Calendar className="w-5 h-5" />,
    color: "bg-orange-500"
  }
];

const getActivityIcon = (iconName: string) => {
  switch (iconName) {
    case "Users":
      return <Users className="w-4 h-4" />;
    case "GraduationCap":
      return <GraduationCap className="w-4 h-4" />;
    case "BookOpenCheck":
      return <BookOpenCheck className="w-4 h-4" />;
    case "UserCheck":
      return <UserCheck className="w-4 h-4" />;
    case "ClipboardList":
      return <ClipboardList className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

export function DashboardContent({ user, selectedSchool, stats }: DashboardContentProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const statItems = [
    {
      title: "Étudiants",
      value: stats.totalStudents,
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      href: "/students"
    },
    {
      title: "Professeurs", 
      value: stats.totalTeachers,
      icon: <GraduationCap className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      href: "/teachers"
    },
    {
      title: "Classes",
      value: stats.totalClassrooms,
      icon: <Building className="w-6 h-6" />,
      color: "text-purple-600", 
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      href: "/classrooms"
    },
    {
      title: "Matières",
      value: stats.totalSubjects,
      icon: <BookOpen className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      href: "/subjects"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {getGreeting()}, {user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {selectedSchool ? (
              <>Bienvenue sur le tableau de bord de <span className="font-medium">{selectedSchool.name}</span></>
            ) : (
              'Voici un aperçu de votre établissement'
            )}
          </p>
        </div>
        
        {stats.totalEnrollments > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="secondary" className="flex items-center space-x-2 text-sm py-2 px-4">
              <BookOpenCheck className="w-4 h-4" />
              <span>{stats.totalEnrollments} inscriptions actives</span>
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Link href={item.href}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.title}
                      </p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {item.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Actions rapides</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link href={action.href}>
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                              {action.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800 dark:text-white">
                                {action.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Activités récentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 dark:text-white font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aucune activité récente
                    </p>
                  </div>
                )}
              </div>
              
              {/* {stats.recentActivities.length > 0 && (
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link href="/notifications">
                    Voir toutes les activités
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )} */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
