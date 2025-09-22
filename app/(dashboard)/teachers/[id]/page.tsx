import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, User, Phone, Mail, MapPin, Heart, Briefcase, Calendar, Hash, Globe, Droplets, FileText, Award, Clock, DollarSign, Shield, BookOpen, Users } from "lucide-react";
import { getTeacherById } from "@/actions/school-members";
import { notFound } from "next/navigation";

interface TeacherDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params;
  const data: any = await getTeacherById(id);

  if (data?.error || !data?.teacher) {
    notFound();
  }

  const teacher = data.teacher;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teachers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {teacher.user?.name || `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.trim() || 'Enseignant'}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'enseignant
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/teachers/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {teacher.subjects?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Matières enseignées
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {teacher.experienceYears || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Années d'expérience
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {teacher.assignments?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Classes assignées
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">
                  {teacher.status === "ACTIVE" ? "Actif" : 
                   teacher.status === "INACTIVE" ? "Inactif" :
                   teacher.status === "TERMINATED" ? "Terminé" :
                   teacher.status === "ON_LEAVE" ? "En congé" : "Actif"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Statut actuel
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations personnelles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nom complet</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.user?.name || `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.trim() || 'Non renseigné'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Numéro d'employé</p>
                  <p className="text-sm text-muted-foreground">{teacher.employeeNumber || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{teacher.user?.email || teacher.email || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">{teacher.user?.phone || teacher.phone || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date de naissance</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.dateOfBirth 
                      ? new Date(teacher.dateOfBirth).toLocaleDateString("fr-FR")
                      : "Non renseignée"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Lieu de naissance</p>
                  <p className="text-sm text-muted-foreground">{teacher.placeOfBirth || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nationalité</p>
                  <p className="text-sm text-muted-foreground">{teacher.nationality || "Non renseignée"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Groupe sanguin</p>
                  <p className="text-sm text-muted-foreground">{teacher.bloodType || "Non renseigné"}</p>
                </div>
              </div>
            </div>

            {teacher.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">{teacher.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact d'urgence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Contact d'urgence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nom du contact</p>
                <p className="text-sm text-muted-foreground">{teacher.emergencyContact || "Non renseigné"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Téléphone d'urgence</p>
                <p className="text-sm text-muted-foreground">{teacher.emergencyPhone || "Non renseigné"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date d'embauche</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.hireDate 
                      ? new Date(teacher.hireDate).toLocaleDateString("fr-FR")
                      : "Non renseignée"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Qualification</p>
                  <p className="text-sm text-muted-foreground">{teacher.qualification || "Non renseignée"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Spécialisation</p>
                  <p className="text-sm text-muted-foreground">{teacher.specialization || "Non renseignée"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Années d'expérience</p>
                  <p className="text-sm text-muted-foreground">{teacher.experienceYears ? `${teacher.experienceYears} ans` : "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Salaire</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.salary ? `${(teacher.salary / 100).toLocaleString()} FCFA` : "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.status === "ACTIVE" ? "Actif" : 
                     teacher.status === "INACTIVE" ? "Inactif" :
                     teacher.status === "TERMINATED" ? "Terminé" :
                     teacher.status === "ON_LEAVE" ? "En congé" : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            {teacher.bio && (
              <div className="flex items-start space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Biographie</p>
                  <p className="text-sm text-muted-foreground">{teacher.bio}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matières et classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Matières & Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Matières enseignées</p>
              {teacher.subjects && teacher.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject: any) => (
                    <span key={subject.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subject.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune matière assignée</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Classes assignées</p>
              {teacher.assignments && teacher.assignments.length > 0 ? (
                <div className="space-y-2">
                  {teacher.assignments.map((assignment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{assignment.classroom?.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.subject?.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{assignment.academicYear?.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune classe assignée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section supplémentaire pour plus d'informations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Métadonnées */}
        <Card>
          <CardHeader>
            <CardTitle>Métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{teacher.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{teacher.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{teacher.updatedAt ? new Date(teacher.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé professionnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {teacher.user?.name || 'Enseignant'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {teacher.specialization || 'Enseignant'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {teacher.experienceYears ? `${teacher.experienceYears} années d'expérience` : 'Expérience non renseignée'}
              </p>
            </div>

            {teacher.bio && (
              <div>
                <p className="text-sm font-medium mb-2">Biographie</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{teacher.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

