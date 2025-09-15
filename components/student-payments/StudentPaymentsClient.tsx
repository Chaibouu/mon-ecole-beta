"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getStudentPayments } from "@/actions/student-payments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Calendar,
  Receipt,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { CreatePaymentDialog } from "./CreatePaymentDialog";

interface StudentPaymentsData {
  student: {
    id: string;
    name: string | null;
    matricule: string | null;
    currentEnrollment: {
      classroom: {
        name: string;
        gradeLevel: {
          id: string;
          name: string;
        };
      };
    } | null;
  };
  summary: {
    totalDue: number;
    totalPaid: number;
    balance: number;
    feeScheduleCount: number;
    paidFeeScheduleCount: number;
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

interface StudentPaymentsClientProps {
  studentId: string;
  initialData?: StudentPaymentsData | null;
}

export function StudentPaymentsClient({ studentId, initialData }: StudentPaymentsClientProps) {
  const [data, setData] = useState<StudentPaymentsData | null>(initialData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load if no initial data provided
    if (!initialData) {
      loadStudentPayments();
    }
  }, [studentId, initialData]);

  const loadStudentPayments = async () => {
    try {
      setLoading(true);
      const result = await getStudentPayments(studentId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setData(result);
    } catch (error) {
      console.error("Error loading student payments:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-100 text-yellow-800">Partiellement payé</Badge>;
      case "PENDING":
        return <Badge className="bg-blue-100 text-blue-800">En attente</Badge>;
      case "OVERDUE":
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const methods: Record<string, string> = {
      CASH: "Espèces",
      BANK_TRANSFER: "Virement",
      MOBILE_MONEY: "Mobile Money",
      CHECK: "Chèque",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement des données de paiement...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune donnée de paiement trouvée</p>
      </div>
    );
  }

  const { student, summary, feeSchedulesByStatus, recentPayments, upcomingPayments } = data;
  const paymentProgress = summary.totalDue > 0 ? (summary.totalPaid / summary.totalDue) * 100 : 0;
  
  // Get unpaid fee schedules for payment creation
  const unpaidFeeSchedules = [...feeSchedulesByStatus.pending, ...feeSchedulesByStatus.partiallyPaid, ...feeSchedulesByStatus.overdue];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
              {(student.name || "Étudiant").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{student.name || "Étudiant"}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {student.matricule && (
                <span>Matricule: {student.matricule}</span>
              )}
              {student.currentEnrollment && (
                <span>
                  {student.currentEnrollment.classroom.gradeLevel.name} - {student.currentEnrollment.classroom.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <CreatePaymentDialog
          studentId={studentId}
          unpaidFeeSchedules={unpaidFeeSchedules}
          onPaymentCreated={loadStudentPayments}
          studentGradeLevel={student.currentEnrollment?.classroom?.gradeLevel}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total à payer</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDue)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.feeScheduleCount} structure{summary.feeScheduleCount > 1 ? "s" : ""} de frais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total payé</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.paidFeeScheduleCount} structure{summary.paidFeeScheduleCount > 1 ? "s" : ""} payée{summary.paidFeeScheduleCount > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde restant</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(summary.balance)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Paiement{summary.overdueCount > 1 ? "s" : ""} en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="fee-schedules">Structures de frais</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="schedule">Échéancier</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Paiements récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-4">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{payment.feeSchedule?.itemName || "Frais scolaires"}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(payment.paidAt), "dd MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {formatCurrency(payment.amountCents)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {getMethodBadge(payment.method)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">Aucun paiement récent</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prochaines échéances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingPayments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingPayments.map((feeSchedule) => (
                      <div key={feeSchedule.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{feeSchedule.itemName}</p>
                          <p className="text-sm text-gray-600">
                            Échéance: {format(new Date(feeSchedule.dueDate), "dd MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(feeSchedule.amountCents)}</p>
                          {getStatusBadge(feeSchedule.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">Aucune échéance à venir</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fee-schedules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(feeSchedulesByStatus).map(([status, feeSchedules]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {status === "paid" && "Frais payés"}
                    {status === "partiallyPaid" && "Partiellement payés"}
                    {status === "pending" && "En attente de paiement"}
                    {status === "overdue" && "Paiements en retard"}
                  </CardTitle>
                  <CardDescription>{feeSchedules.length} structure{feeSchedules.length > 1 ? "s" : ""} de frais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feeSchedules.map((feeSchedule) => (
                      <div key={feeSchedule.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{feeSchedule.itemName}</h4>
                          {getStatusBadge(feeSchedule.status)}
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(feeSchedule.amountCents)}</p>
                        {feeSchedule.dueDate && (
                          <p className="text-xs text-gray-600">
                            Échéance: {format(new Date(feeSchedule.dueDate), "dd/MM/yyyy")}
                          </p>
                        )}
                        {feeSchedule.totalPaid > 0 && (
                          <p className="text-xs text-green-600">
                            Payé: {formatCurrency(feeSchedule.totalPaid)}
                          </p>
                        )}
                        {feeSchedule.remainingAmount > 0 && (
                          <p className="text-xs text-red-600">
                            Restant: {formatCurrency(feeSchedule.remainingAmount)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Tous les paiements effectués par l'étudiant</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.feeSchedule?.itemName || "Frais scolaires"}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(payment.paidAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500">Réf: {payment.reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.amountCents)}
                        </p>
                        <Badge variant="outline">{getMethodBadge(payment.method)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Échéancier de paiement</CardTitle>
              <CardDescription>Planning des paiements à venir</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((feeSchedule) => {
                    const progress = feeSchedule.amountCents > 0 ? (feeSchedule.totalPaid / feeSchedule.amountCents) * 100 : 0;

                    return (
                      <div key={feeSchedule.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{feeSchedule.itemName}</h4>
                            <p className="text-sm text-gray-600">
                              Échéance: {format(new Date(feeSchedule.dueDate), "dd MMMM yyyy", { locale: fr })}
                            </p>
                          </div>
                          {getStatusBadge(feeSchedule.status)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Montant total:</span>
                            <span className="font-medium">{formatCurrency(feeSchedule.amountCents)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Payé:</span>
                            <span className="font-medium text-green-600">{formatCurrency(feeSchedule.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Restant:</span>
                            <span className="font-medium text-red-600">{formatCurrency(feeSchedule.remainingAmount)}</span>
                          </div>
                          
                          <Progress value={progress} className="mt-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Aucune échéance à venir</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
