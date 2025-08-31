import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Users } from "lucide-react";
import { getSchoolById } from "@/actions/schools";
import { getSchoolMembers } from "@/actions/school-members";
import { SchoolDetailActions } from "@/components/schools/school-detail-actions";
import { SchoolMembersTabs } from "@/components/schools/school-members-tabs";

interface SchoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { id } = await params;
  const [schoolResult, membersResult] = await Promise.all([
    getSchoolById(id),
    getSchoolMembers(id),
  ]);

  if (schoolResult?.error || !schoolResult?.school) {
    notFound();
  }

  const school = schoolResult.school;
  const members = membersResult?.members || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/schools">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
            <p className="text-muted-foreground">Code: {school.code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/schools/${school.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <SchoolDetailActions school={school} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="text-sm">{school.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-sm">{school.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <div>
                <Badge variant={school.isActive ? "default" : "secondary"}>
                  {school.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            {school.slogan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slogan</label>
                <p className="text-sm">{school.slogan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{school.email || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <p className="text-sm">{school.phone || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Adresse</label>
              <p className="text-sm">{school.address || "Non renseignée"}</p>
            </div>
            {school.websiteUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Site web</label>
                <p className="text-sm">
                  <a 
                    href={school.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {school.websiteUrl}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(school.brandPrimaryColor || school.brandSecondaryColor || school.logoUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {school.logoUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Logo</label>
                  <div className="mt-2">
                    <img
                      
                      src={school.logoUrl} 
                      alt="Logo de l'école" 
                      className="h-16 w-16 object-contain border rounded"
                      // onError={(e) => {
                      //   e.currentTarget.style.display = 'none';
                      // }}
                    />
                  </div>
                </div>
              )}
              {school.brandPrimaryColor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Couleur primaire</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div 
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: school.brandPrimaryColor }}
                    />
                    <span className="text-sm">{school.brandPrimaryColor}</span>
                  </div>
                </div>
              )}
              {school.brandSecondaryColor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Couleur secondaire</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div 
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: school.brandSecondaryColor }}
                    />
                    <span className="text-sm">{school.brandSecondaryColor}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Gestion des Membres */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Gestion des Membres</CardTitle>
            <Badge variant="secondary">{members.length} membres</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SchoolMembersTabs schoolId={id} initialMembers={members} />
        </CardContent>
      </Card>
    </div>
  );
}