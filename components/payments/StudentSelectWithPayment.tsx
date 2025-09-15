"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CreatePaymentDialog } from "../student-payments/CreatePaymentDialog";
import { Progress } from "@/components/ui/progress";
import { searchStudents, getStudentPayments } from "@/actions/student-payments";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { User, CreditCard, DollarSign, Receipt, AlertCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  matricule: string | null;
  user: {
    name: string | null;
  };
  enrollments: Array<{
    classroom: {
      name: string;
      gradeLevel: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface StudentPaymentData {
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
}

export function StudentSelectWithPayment() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPaymentData, setStudentPaymentData] = useState<StudentPaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();

  // Load students for select
  useEffect(() => {
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    try {
      setLoading(true);
      const data = await searchStudents(""); // Empty search to get all students
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Erreur lors du chargement des élèves");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPaymentData = async (studentId: string) => {
    try {
      setPaymentLoading(true);
      const data = await getStudentPayments(studentId);
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setStudentPaymentData(data);
    } catch (error) {
      console.error("Error loading student payment data:", error);
      toast.error("Erreur lors du chargement des données de paiement");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    setStudentPaymentData(null);
    
    if (student) {
      loadStudentPaymentData(student.id);
    }
  };


  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.user?.name || "Nom non renseigné"} ${student.matricule ? `(#${student.matricule})` : ""}`,
    student: student,
  }));

  const unpaidFeeSchedules = studentPaymentData ? [
    ...studentPaymentData.feeSchedulesByStatus.pending,
    ...studentPaymentData.feeSchedulesByStatus.partiallyPaid,
    ...studentPaymentData.feeSchedulesByStatus.overdue
  ] : [];

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sélectionner un élève pour gérer ses paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchableSelect
            options={studentOptions}
            value={selectedStudent ? { 
              value: selectedStudent.id, 
              label: `${selectedStudent.user?.name || "Nom non renseigné"} ${selectedStudent.matricule ? `(#${selectedStudent.matricule})` : ""}` 
            } : null}
            onChange={(option) => {
              const student = option ? students.find(s => s.id === option.value) || null : null;
              handleStudentSelect(student);
            }}
            placeholder="Rechercher un élève par nom ou matricule..."
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Student Payment Summary */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                    {(selectedStudent.user?.name || "Élève").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{selectedStudent.user?.name || "Nom non renseigné"}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {selectedStudent.matricule && (
                      <span>#{selectedStudent.matricule}</span>
                    )}
                    {selectedStudent.enrollments[0] && (
                      <Badge variant="outline">
                        {selectedStudent.enrollments[0].classroom.gradeLevel.name} - {selectedStudent.enrollments[0].classroom.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/students/${selectedStudent.id}/payments`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </Button>
                {studentPaymentData && (
                  <CreatePaymentDialog
                    studentId={selectedStudent.id}
                    unpaidFeeSchedules={unpaidFeeSchedules}
                    onPaymentCreated={() => {
                      loadStudentPaymentData(selectedStudent.id);
                      router.refresh(); // Rafraîchir les données globales
                    }}
                    studentGradeLevel={selectedStudent.enrollments[0]?.classroom?.gradeLevel}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paymentLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Chargement des données de paiement...</p>
              </div>
            ) : studentPaymentData ? (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Receipt className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total à payer</p>
                      <p className="font-bold text-lg">{formatCurrency(studentPaymentData.summary.totalDue)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total payé</p>
                      <p className="font-bold text-lg text-green-600">{formatCurrency(studentPaymentData.summary.totalPaid)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Solde restant</p>
                      <p className={`font-bold text-lg ${studentPaymentData.summary.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(studentPaymentData.summary.balance)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">En retard</p>
                      <p className="font-bold text-lg text-red-600">{studentPaymentData.summary.overdueCount}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression des paiements</span>
                    <span>
                      {studentPaymentData.summary.totalDue > 0 
                        ? Math.round((studentPaymentData.summary.totalPaid / studentPaymentData.summary.totalDue) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={studentPaymentData.summary.totalDue > 0 
                      ? (studentPaymentData.summary.totalPaid / studentPaymentData.summary.totalDue) * 100 
                      : 0} 
                    className="h-2"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{studentPaymentData.feeSchedulesByStatus.paid.length}</p>
                    <p className="text-sm text-gray-600">Frais payés</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{studentPaymentData.feeSchedulesByStatus.partiallyPaid.length}</p>
                    <p className="text-sm text-gray-600">Partiellement payées</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{studentPaymentData.feeSchedulesByStatus.pending.length}</p>
                    <p className="text-sm text-gray-600">En attente</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{studentPaymentData.feeSchedulesByStatus.overdue.length}</p>
                    <p className="text-sm text-gray-600">En retard</p>
                  </div>
                </div>

                {unpaidFeeSchedules.length === 0 && (
                  <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                    <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Tous les paiements sont à jour !</p>
                    <p className="text-green-600 text-sm">Cet élève n'a aucune frais de scolarité impayée.</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Frais totaux: {studentPaymentData?.summary.feeScheduleCount || 0}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-600">Sélectionnez un élève pour voir ses informations de paiement</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
