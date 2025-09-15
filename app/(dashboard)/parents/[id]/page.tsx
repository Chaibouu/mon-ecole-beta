import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Users, Heart, Phone, Mail, MapPin, Calendar, User, Briefcase, Building, Globe } from "lucide-react";
import { getParentById } from "@/actions/parents";
import { notFound } from "next/navigation";

interface ParentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParentDetailPage({ params }: ParentDetailPageProps) {
  const { id } = await params;
  const data: any = await getParentById(id);

  if (data?.error || !data?.parent) {
    notFound();
  }

  const parent = data.parent;
  const children = parent.children || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/parents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{parent.user?.name || "Parent sans nom"}</h1>
            <p className="text-muted-foreground">
              Détails du parent d'élève
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/parents/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Nom complet:</span>
              <span>{parent.user?.name || "Non renseigné"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Email:</span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{parent.user?.email || "Non renseigné"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Téléphone:</span>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{parent.phone || "Non renseigné"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Adresse:</span>
              <div className="flex items-center gap-2 text-right max-w-xs">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{parent.address || "Non renseignée"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Statut:</span>
              <Badge variant={parent.user?.isActive ? "default" : "secondary"}>
                {parent.user?.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Profession:</span>
              <span>{parent.profession || "Non renseignée"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Lieu de travail:</span>
              <div className="flex items-center gap-2 text-right max-w-xs">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{parent.workplace || "Non renseigné"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Langue préférée:</span>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{parent.preferredLanguage || "Non renseignée"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enfants liés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Enfants ({children.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
              <div className="space-y-3">
                    {children.map((link: any) => (
                      <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {link.student?.user?.name || "Nom non disponible"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Relation: {link.relationship}
                          </p>
                          {link.student?.studentNumber && (
                            <p className="text-xs text-muted-foreground">
                              N° étudiant: {link.student.studentNumber}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/students/${link.studentProfileId}`}>
                            Voir
                          </Link>
                        </Button>
                      </div>
                    ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun enfant lié à ce parent
              </p>
            )}
          </CardContent>
        </Card>

        {/* Métadonnées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Métadonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-sm">{parent.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">École ID:</span>
              <span className="font-mono text-sm">{parent.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Créé le:</span>
              <span>{parent.createdAt ? new Date(parent.createdAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modifié le:</span>
              <span>{parent.updatedAt ? new Date(parent.updatedAt).toLocaleDateString('fr-FR') : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Utilisateur vérifié:</span>
              <Badge variant={parent.user?.emailVerified ? "default" : "secondary"}>
                {parent.user?.emailVerified ? "Vérifié" : "Non vérifié"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section supplémentaire pour les statistiques ou actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/parents/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier les informations
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/parents">
                <Users className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Nombre d'enfants:</span>
              <span className="font-bold text-lg">{children.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Compte actif:</span>
              <Badge variant={parent.user?.isActive ? "default" : "destructive"}>
                {parent.user?.isActive ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email vérifié:</span>
              <Badge variant={parent.user?.emailVerified ? "default" : "secondary"}>
                {parent.user?.emailVerified ? "Oui" : "Non"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
