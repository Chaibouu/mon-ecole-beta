"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CreditCard, DollarSign, Receipt, AlertTriangle, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { listPayments, createPayment } from "@/actions/school-fees";
import { QuickStudentSearch } from "./QuickStudentSearch";
import { PaymentGuide } from "./PaymentGuide";
import { StudentSelectWithPayment } from "./StudentSelectWithPayment";

type Payment = {
  id: string;
  amountCents: number;
  method: string | null;
  reference: string | null;
  paidAt: string;
  student: {
    user: { name: string; };
  };
  feeSchedule: {
    itemName: string;
  };
};

type Analytics = {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  pendingAmount: number;
  overdueAmount: number;
};

interface PaymentsClientProps {
  initialPayments: Payment[];
  gradeLevels: Array<{ id: string; name: string; }>;
  classrooms: Array<{ id: string; name: string; gradeLevel?: { id: string; name: string; } }>;
  analytics: Analytics;
}

export default function PaymentsClient({
  initialPayments,
  gradeLevels,
  classrooms,
  analytics,
}: PaymentsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    gradeLevelId: "",
    search: "",
    dateRange: "", // nouveau filtre pour période
    status: "", // nouveau filtre pour statut
  });

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      if (filters.gradeLevelId && !payment.student?.user?.name?.toLowerCase().includes(filters.gradeLevelId.toLowerCase())) {
        // TODO: Améliorer le filtrage par niveau quand on aura les relations
        return true;
      }
      if (filters.search && !payment.student?.user?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.dateRange) {
        const paymentDate = new Date(payment.paidAt);
        const today = new Date();
        switch (filters.dateRange) {
          case "today":
            if (paymentDate.toDateString() !== today.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (paymentDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (paymentDate < monthAgo) return false;
            break;
        }
      }
      return true;
    });
  }, [payments, filters]);

  return (
    <div className="space-y-6">
      {/* Payment Guide */}
      <PaymentGuide />
      
      {/* Student Selection with Payment */}
      <StudentSelectWithPayment />
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.totalExpected / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collecté</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(analytics.totalCollected / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Recouvrement</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.collectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant En Attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(analytics.pendingAmount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'XOF'
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique des Paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 items-end">
              <div>
                <Label>Rechercher un élève</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nom de l'élève..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Période</Label>
                <Select 
                  value={filters.dateRange || "all"} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{payment.student?.user?.name}</span>
                        {payment.method && (
                          <Badge variant="outline">
                            {payment.method === "CASH" && "Espèces"}
                            {payment.method === "BANK_TRANSFER" && "Virement"}
                            {payment.method === "MOBILE_MONEY" && "Mobile Money"}
                            {payment.method === "CHECK" && "Chèque"}
                            {payment.method === "CARD" && "Carte"}
                            {!["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHECK", "CARD"].includes(payment.method) && payment.method}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {payment.feeSchedule?.itemName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Payé le: {new Date(payment.paidAt).toLocaleDateString('fr-FR')} à {new Date(payment.paidAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {payment.reference && (
                          <span>Réf: {payment.reference}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {(payment.amountCents / 100).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'XOF'
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun paiement trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
