import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { listSubjectCategories } from "@/actions/subject-categories";
import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { CategoriesTableWrapper } from "@/components/subject-categories/categories-table-wrapper";

export default async function SubjectCategoriesPage() {
  const data: any = await listSubjectCategories();
  if (data?.error) {
    throw new Error(data.error);
  }
  const categories = Array.isArray(data?.subjectCategories) ? data.subjectCategories : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catégories de matières"
        description="Gérez les catégories (Littéraire, Scientifique, Langues, etc.)"
        icon={Tags}
        actions={
          <Button asChild>
            <Link href="/subject-categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer une catégorie
            </Link>
          </Button>
        }
      />

      <EnhancedCard
        title="Liste des catégories"
        description="Classez vos matières par catégories personnalisées"
        icon={Tags}
        gradient={true}
      >
        <CategoriesTableWrapper initialItems={categories} />
      </EnhancedCard>
    </div>
  );
}















