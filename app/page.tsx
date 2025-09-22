"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Clock, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  School,
  UserCheck,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/login-button";
import appConfig from "@/settings";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: GraduationCap,
    title: "Gestion des Élèves",
    description: "Inscriptions, profils, suivi académique et dossiers complets de tous vos élèves",
    color: "bg-blue-500"
  },
  {
    icon: Users,
    title: "Corps Enseignant",
    description: "Gestion des enseignants, matières, emplois du temps et évaluations",
    color: "bg-green-500"
  },
  {
    icon: Heart,
    title: "Espace Parents",
    description: "Suivi des enfants, communication école-famille et paiements en ligne",
    color: "bg-pink-500"
  },
  {
    icon: BarChart3,
    title: "Tableau de Bord",
    description: "Statistiques en temps réel, rapports détaillés et analyses de performance",
    color: "bg-purple-500"
  },
  {
    icon: BookOpen,
    title: "Gestion Académique",
    description: "Classes, matières, notes, bulletins et suivi pédagogique complet",
    color: "bg-orange-500"
  },
  {
    icon: Shield,
    title: "Sécurité Avancée",
    description: "Données protégées, accès sécurisés et conformité aux normes",
    color: "bg-red-500"
  }
];

const stats = [
  { icon: School, value: "500+", label: "Établissements" },
  { icon: GraduationCap, value: "50K+", label: "Élèves" },
  { icon: Users, value: "5K+", label: "Enseignants" },
  { icon: Heart, value: "25K+", label: "Parents" }
];

const benefits = [
  "Interface intuitive et moderne",
  "Gestion centralisée multi-établissement",
  "Suivi en temps réel des performances",
  "Communication simplifiée école-famille",
  "Automatisation des tâches administratives",
  "Support technique 24/7"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{appConfig.appName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton asChild>
                <Button >Se connecter</Button>
              </LoginButton>
              {/* <Button asChild>
                <Link href="/auth/signup">Commencer</Link>
              </Button> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl shadow-lg mx-auto w-fit">
                <GraduationCap className="h-16 w-16 text-white mx-auto" />
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Gestion Scolaire
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Simplifiée
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              {appConfig.websiteDescription || "Gérez votre établissement scolaire avec une plateforme moderne, intuitive et complète. De l'inscription des élèves au suivi des performances."}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <LoginButton asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                  Accéder au Tableau de Bord
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </LoginButton>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Découvrir les fonctionnalités</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Fonctionnalités Complètes
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Tout ce dont vous avez besoin pour gérer efficacement votre établissement scolaire
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              >
                Pourquoi Choisir Mon École ?
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8"
              >
                Une solution complète pensée pour simplifier la gestion de votre établissement et améliorer l'expérience de tous les utilisateurs.
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">70%</div>
                    <div className="text-sm text-gray-600">Temps Économisé</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <UserCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">5/5</div>
                    <div className="text-sm text-gray-600">Note Moyenne</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Prêt à Moderniser Votre Établissement ?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-blue-100 mb-8"
            >
              Rejoignez des centaines d'établissements qui font confiance à Mon École pour leur gestion quotidienne.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <LoginButton asChild>
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  Se Connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </LoginButton>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                Demander une Démo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">{appConfig.appName}</span>
              </div>
              <p className="text-gray-400">
                La solution complète pour la gestion de votre établissement scolaire.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Gestion des élèves</li>
                <li>Corps enseignant</li>
                <li>Espace parents</li>
                <li>Tableau de bord</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>Formation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li>À propos</li>
                <li>Blog</li>
                <li>Carrières</li>
                <li>Partenaires</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {appConfig.appName}. Tous droits réservés.</p>
        </div>
      </div>
      </footer>
      </div>
  );
}
