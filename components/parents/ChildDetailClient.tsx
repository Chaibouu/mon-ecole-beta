"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import {
  User,
  GraduationCap,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  TrendingUp,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface ChildDetail {
  id: string;
  name: string | null;
  matricule: string | null;
  gender: string;
  dateOfBirth?: string;
  currentEnrollment: {
    classroom: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
    academicYear: {
      name: string;
    };
  } | null;
  summary: {
    totalDue: number;
    totalPaid: number;
    balance: number;
    overdueCount: number;
  };
  feeSchedulesByStatus: {
    paid: any[];
    partiallyPaid: any[];
    pending: any[];
    overdue: any[];
  };
  recentPayments: any[];
  upcomingPayments: any[];
}

interface ChildDetailClientProps {
  childId: string;
  initialData?: ChildDetail | null;
}

export function ChildDetailClient({ childId, initialData }: ChildDetailClientProps) {
  const [data, setData] = useState<ChildDetail | null>(initialData || null);
  const router = useRouter();

  const refreshData = () => {
    // Utiliser router.refresh() pour revalider les données côté serveur
    router.refresh();
  };

  if (!data) {
    toast.error("Aucune donnée disponible pour cet enfant");
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Aucune donnée disponible</p>
          <Button onClick={refreshData} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>
    );
  }

  const { student, summary, feeSchedulesByStatus, recentPayments, upcomingPayments } = data as any;
  const paymentProgress = summary.totalDue > 0 ? (summary.totalPaid / summary.totalDue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/parents/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au dashboard
          </Link>
        </Button>
      </div>

      {/* Informations de l'enfant */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-blue-600" />
                {student.name || "Nom non défini"}
              </CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-4 text-sm">
                  <span>Matricule: {student.matricule || "Non défini"}</span>
                  <Badge variant="outline">{student.currentEnrollment?.classroom?.gradeLevel?.name}</Badge>
                  <Badge variant="secondary">{student.currentEnrollment?.classroom?.name}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  Année académique: {student.currentEnrollment?.academicYear?.name || "Non définie"}
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Résumé financier */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total à payer</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDue)}</div>
            <p className="text-xs text-muted-foreground">Frais de scolarité</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payé</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-muted-foreground">{paymentProgress.toFixed(0)}% du total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reste à payer</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.balance)}</div>
            <p className="text-xs text-muted-foreground">Solde en attente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Paiements en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Détails des paiements */}
      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fees">Frais scolaires</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-4">
          <div className="grid gap-4">
            {/* Frais payés */}
            {feeSchedulesByStatus.paid.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Frais payés ({feeSchedulesByStatus.paid.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feeSchedulesByStatus.paid.map((fee: any) => (
                      <div key={fee.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900">{fee.itemName}</p>
                          <p className="text-xs text-green-700">
                            Échéance: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(fee.amountCents)}</p>
                          <Badge variant="secondary" className="text-xs">Payé</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Frais partiellement payés */}
            {feeSchedulesByStatus.partiallyPaid.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    Frais partiellement payés ({feeSchedulesByStatus.partiallyPaid.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feeSchedulesByStatus.partiallyPaid.map((fee: any) => (
                      <div key={fee.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium text-orange-900">{fee.itemName}</p>
                          <p className="text-xs text-orange-700">
                            Payé: {formatCurrency(fee.totalPaid)} sur {formatCurrency(fee.amountCents)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{formatCurrency(fee.remainingAmount)}</p>
                          <Badge variant="outline" className="text-xs">Reste à payer</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Frais en attente */}
            {feeSchedulesByStatus.pending.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4" />
                    Frais en attente ({feeSchedulesByStatus.pending.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feeSchedulesByStatus.pending.map((fee: any) => (
                      <div key={fee.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-blue-900">{fee.itemName}</p>
                          <p className="text-xs text-blue-700">
                            Échéance: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatCurrency(fee.amountCents)}</p>
                          <Badge variant="outline" className="text-xs">En attente</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Frais en retard */}
            {feeSchedulesByStatus.overdue.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    Frais en retard ({feeSchedulesByStatus.overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feeSchedulesByStatus.overdue.map((fee: any) => (
                      <div key={fee.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-l-red-500">
                        <div>
                          <p className="font-medium text-red-900">{fee.itemName}</p>
                          <p className="text-xs text-red-700">
                            Échéance dépassée: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(fee.remainingAmount || fee.amountCents)}</p>
                          <Badge variant="destructive" className="text-xs">En retard</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Historique des paiements
              </CardTitle>
              <CardDescription>
                Tous les paiements effectués pour cet enfant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.feeSchedule.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.paidAt).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(payment.paidAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(payment.amountCents)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {payment.method === 'CASH' ? 'Espèces' : 
                           payment.method === 'BANK_TRANSFER' ? 'Virement' : 
                           payment.method === 'MOBILE_MONEY' ? 'Mobile Money' : payment.method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun paiement enregistré pour cet enfant
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prochaines échéances
              </CardTitle>
              <CardDescription>
                Frais à payer dans les prochaines semaines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingPayments.map((upcoming: any) => (
                    <div key={upcoming.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-500">
                      <div>
                        <p className="font-medium text-yellow-900">{upcoming.itemName}</p>
                        <p className="text-sm text-yellow-700">
                          Échéance: {new Date(upcoming.dueDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Dans {Math.ceil((new Date(upcoming.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{formatCurrency(upcoming.remainingAmount || upcoming.amountCents)}</p>
                        <Badge variant="outline" className="text-xs">À payer</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune échéance prochaine
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
