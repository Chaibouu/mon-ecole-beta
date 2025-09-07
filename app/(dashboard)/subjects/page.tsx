import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SubjectsTableWrapper } from "@/components/subjects/subjects-table-wrapper";
import { listSubjects } from "@/actions/subjects";
import Link from "next/link";
import { Plus, BookOpen, Calculator, Beaker, Globe } from "lucide-react";
import { listSubjectCategories } from "@/actions/subject-categories";

export default async function SubjectsPage() {
  const [data, catRes]: any = await Promise.all([
    listSubjects(),
    listSubjectCategories(),
  ]);
  if (data?.error) {
    throw new Error(data.error);
  }

  const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
  const categories = Array.isArray(catRes?.subjectCategories) ? catRes.subjectCategories : [];
  
  // Calculer les statistiques
  const totalSubjects = subjects.length;
  const literarySubjects = subjects.filter((s: any) => s.category?.name?.toLowerCase().includes('litt')).length;
  const scientificSubjects = subjects.filter((s: any) => s.category?.name?.toLowerCase().includes('scien')).length;
  const languageSubjects = subjects.filter((s: any) => s.category?.name?.toLowerCase().includes('lang')).length;

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
