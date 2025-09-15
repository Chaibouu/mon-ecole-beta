import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TermsTableWrapper } from "@/components/terms/terms-table-wrapper";
import { listTerms } from "@/actions/terms";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TermsPage() {
  const data: any = await listTerms();
  if (data?.error) {
    throw new Error(data.error);
  }

  const terms = Array.isArray(data?.terms) ? data.terms : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Périodes scolaires</h1>
          <p className="text-muted-foreground">
            Gérez les périodes scolaires de votre établissement
          </p>
        </div>
        <Button asChild>
          <Link href="/terms/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une période
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des périodes</CardTitle>
        </CardHeader>
        <CardContent>
          <TermsTableWrapper initialTerms={terms} />
        </CardContent>
      </Card>
    </div>
  );
}







