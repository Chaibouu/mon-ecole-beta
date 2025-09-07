"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    CreditCard,
    Clock,
    AlertTriangle,
    CheckCircle,
    User,
    GraduationCap,
    Calendar,
    Eye,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Bell,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

interface Child {
    id: string;
    name: string | null;
    matricule: string | null;
    gender: string;
    relationship: string;
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
    recentPayments: Array<{
        id: string;
        amountCents: number;
        paidAt: string;
        feeSchedule: {
            itemName: string;
        };
    }>;
    upcomingPayments: Array<{
        id: string;
        itemName: string;
        amountCents: number;
        dueDate: string;
        remainingAmount: number;
    }>;
}

interface ParentData {
    globalSummary: {
        totalDue: number;
        totalPaid: number;
        balance: number;
        overdueCount: number;
    };
    children: Child[];
}

interface ParentDashboardClientProps {
    initialData?: ParentData | null;
}

export function ParentDashboardClient({ initialData }: ParentDashboardClientProps) {
  const [data, setData] = useState<ParentData | null>(initialData || null);
  const router = useRouter();

  const refreshData = () => {
    // Utiliser router.refresh() pour revalider les données côté serveur
    router.refresh();
  };

  if (!data) {
    toast.error("Aucune donnée disponible");
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

    const { globalSummary, children } = data;

    const paymentTrend = globalSummary.totalPaid > 0 ?
        ((globalSummary.totalPaid / globalSummary.totalDue) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                        <Bell className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Notifications</p>
                        <Badge variant="secondary" className="mt-1">2 nouvelles</Badge>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Bulletins</p>
                        <p className="text-xs text-green-700">Disponibles</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium text-purple-900">Calendrier</p>
                        <p className="text-xs text-purple-700">Événements</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                        <Settings className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">Paramètres</p>
                        <p className="text-xs text-orange-700">Profil</p>
                    </CardContent>
                </Card>
            </div>

            {/* Résumé global */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total à payer</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(globalSummary.totalDue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pour tous vos enfants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total payé</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(globalSummary.totalPaid)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {paymentTrend > 50 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <p className="text-xs text-muted-foreground">
                                {paymentTrend.toFixed(0)}% du total
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reste à payer</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(globalSummary.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Montant en attente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En retard</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {globalSummary.overdueCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Paiements en retard
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des enfants */}
            <div className="space-y-6">
                <h2 className="text-lg font-semibold">Mes enfants</h2>

        {children.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun enfant trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contactez l'administration pour vérifier les liaisons parent-enfant.
            </p>
          </div>
        ) : (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        {children.map((child) => (
                            <Card key={child.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {child.name || "Nom non défini"}
                                            </CardTitle>
                                            <CardDescription className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs">Matricule: {child.matricule || "Non défini"}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {child.relationship}
                                                    </Badge>
                                                </div>
                                                {child.currentEnrollment && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {child.currentEnrollment.classroom.gradeLevel.name} - {child.currentEnrollment.classroom.name}
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/parents/children/${child.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Détails
                                                </Button>
                                            </Link>
                                            <Link href={`/students/${child.id}/payments`}>
                                                <Button variant="ghost" size="sm">
                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                    Paiements
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Résumé des paiements */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total à payer</p>
                                            <p className="font-medium">{formatCurrency(child.summary.totalDue)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Payé</p>
                                            <p className="font-medium text-green-600">{formatCurrency(child.summary.totalPaid)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Reste</p>
                                            <p className="font-medium text-orange-600">{formatCurrency(child.summary.balance)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">En retard</p>
                                            <p className="font-medium text-red-600">{child.summary.overdueCount}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Paiements récents */}
                                    {child.recentPayments.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                Paiements récents
                                            </h4>
                                            <div className="space-y-1">
                                                {child.recentPayments.slice(0, 3).map((payment) => (
                                                    <div key={payment.id} className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground">
                                                            {payment.feeSchedule.itemName}
                                                        </span>
                                                        <div className="text-right">
                                                            <div className="font-medium text-green-600">
                                                                {formatCurrency(payment.amountCents)}
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Prochaines échéances */}
                                    {child.upcomingPayments.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-orange-600" />
                                                Prochaines échéances
                                            </h4>
                                            <div className="space-y-1">
                                                {child.upcomingPayments.slice(0, 3).map((upcoming) => (
                                                    <div key={upcoming.id} className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground">
                                                            {upcoming.itemName}
                                                        </span>
                                                        <div className="text-right">
                                                            <div className="font-medium text-orange-600">
                                                                {formatCurrency(upcoming.remainingAmount)}
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                Échéance: {new Date(upcoming.dueDate).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {child.recentPayments.length === 0 && child.upcomingPayments.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Aucune activité de paiement récente
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
