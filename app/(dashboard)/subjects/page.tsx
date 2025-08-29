import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SubjectsTableWrapper } from "@/components/subjects/subjects-table-wrapper";
import { listSubjects } from "@/actions/subjects";
import Link from "next/link";
import { Plus, BookOpen, Calculator, Beaker, Globe } from "lucide-react";

export default async function SubjectsPage() {
  const data: any = await listSubjects();
  if (data?.error) {
    throw new Error(data.error);
  }

  const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
  
  // Calculer les statistiques
  const totalSubjects = subjects.length;
  const literarySubjects = subjects.filter((subject: any) => 
    subject.name?.toLowerCase().includes('français') || 
    subject.name?.toLowerCase().includes('littérature') ||
    subject.name?.toLowerCase().includes('histoire')
  ).length;
  const scientificSubjects = subjects.filter((subject: any) => 
    subject.name?.toLowerCase().includes('mathématiques') || 
    subject.name?.toLowerCase().includes('physique') ||
    subject.name?.toLowerCase().includes('chimie') ||
    subject.name?.toLowerCase().includes('biologie')
  ).length;
  const languageSubjects = subjects.filter((subject: any) => 
    subject.name?.toLowerCase().includes('anglais') || 
    subject.name?.toLowerCase().includes('espagnol') ||
    subject.name?.toLowerCase().includes('allemand')
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Matières"
        description="Gérez les matières enseignées dans votre établissement"
        icon={BookOpen}
        actions={
          <Button asChild>
            <Link href="/subjects/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une matière
            </Link>
          </Button>
        }
      />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des matières"
          value={totalSubjects}
          description="Disciplines enseignées"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Matières scientifiques"
          value={scientificSubjects}
          description="Sciences exactes"
          icon={Calculator}
          color="green"
        />
        <StatsCard
          title="Matières littéraires"
          value={literarySubjects}
          description="Lettres et sciences humaines"
          icon={Beaker}
          color="purple"
        />
        <StatsCard
          title="Langues"
          value={languageSubjects}
          description="Langues étrangères"
          icon={Globe}
          color="indigo"
        />
      </div>

      {/* Tableau des matières */}
      <EnhancedCard
        title="Liste des matières"
        description="Gérez toutes les matières de votre programme scolaire"
        icon={BookOpen}
        gradient={true}
      >
        <SubjectsTableWrapper initialSubjects={subjects} />
      </EnhancedCard>
    </div>
  );
}
