"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CreditCard, 
  Search, 
  ArrowRight, 
  CheckCircle,
  Info
} from "lucide-react";
import Link from "next/link";

export function PaymentGuide() {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Comment enregistrer un paiement ?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">Méthode 1</Badge>
              <span className="font-medium">Via la liste des élèves</span>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Allez sur la page "Élèves"</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span>Cliquez sur ⋯ à droite d'un élève</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>Sélectionnez "Paiements"</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Cliquez "Nouveau paiement"</span>
              </div>
            </div>
            <Button asChild size="sm" className="w-full">
              <Link href="/students">
                <Users className="mr-2 h-4 w-4" />
                Aller aux élèves
              </Link>
            </Button>
          </div>

          {/* Method 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-600 text-green-600">Méthode 2</Badge>
              <span className="font-medium">Recherche rapide</span>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span>Utilisez la recherche ci-dessus</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span>Tapez le nom ou matricule</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>Cliquez sur l'élève trouvé</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Accès direct aux paiements</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                💡 Plus rapide pour les paiements fréquents !
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Fonctionnalités disponibles :</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Suivi des soldes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Historique complet</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Échéancier</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Multiples méthodes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}












