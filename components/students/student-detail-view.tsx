"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Edit,
  ArrowLeft,
  School,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Droplets,
  Flag,
  Home,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StudentForm } from "./student-form";

interface StudentDetailViewProps {
  studentId: string;
  initialData: any;
}

export function StudentDetailView({ studentId, initialData }: StudentDetailViewProps) {
  const [student] = useState<any>(initialData);
  const router = useRouter();


  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Élève non trouvé</h3>
        <p className="text-gray-500 mb-4">L'élève demandé n'existe pas ou vous n'avez pas les permissions nécessaires.</p>
        <Button onClick={() => router.push("/students")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }


  const { student: studentData, paymentSummary, attendanceSummary, academicSummary, currentEnrollment } = student;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/students")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Profil de l'élève</h1>
        </div>
        <Button onClick={() => router.push(`/students/${studentId}/edit`)} className="flex items-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>Modifier</span>
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {studentData.user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'E'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{studentData.user.name}</h2>
              <div className="flex flex-wrap gap-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Matricule: {studentData.matricule || 'Non défini'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{studentData.user.email || 'Email non défini'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{studentData.user.phone || 'Téléphone non défini'}</span>
                </div>
                {currentEnrollment && (
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4" />
                    <span>{currentEnrollment.classroom.name} - {currentEnrollment.classroom.gradeLevel.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {studentData.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Moyenne générale</p>
                <p className="text-3xl font-bold text-green-700">
                  {academicSummary.overallAverage.toFixed(1)}/20
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Taux de présence</p>
                <p className="text-3xl font-bold text-blue-700">
                  {attendanceSummary.attendanceRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Solde des frais</p>
                <p className="text-3xl font-bold text-purple-700">
                  {(paymentSummary.balance / 100).toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total notes</p>
                <p className="text-3xl font-bold text-orange-700">
                  {academicSummary.totalGrades}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="academic">Académique</TabsTrigger>
          <TabsTrigger value="attendance">Assiduité</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>Performance académique</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Moyenne générale</span>
                  <span className="font-semibold">{academicSummary.overallAverage.toFixed(1)}/20</span>
                </div>
                <Progress value={academicSummary.overallAverage * 5} className="h-2" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Moyennes par matière</h4>
                  {academicSummary.subjectAverages.slice(0, 5).map((subject: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{subject.subject}</span>
                      <span className="font-medium">{subject.average.toFixed(1)}/20</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span>Résumé d'assiduité</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Taux de présence</span>
                  <span className="font-semibold">{attendanceSummary.attendanceRate.toFixed(1)}%</span>
                </div>
                <Progress value={attendanceSummary.attendanceRate} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Présent: {attendanceSummary.presentCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Absent: {attendanceSummary.absentCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>En retard: {attendanceSummary.lateCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span>Total: {attendanceSummary.totalRecords}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Moyennes par matière</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {academicSummary.subjectAverages.map((subject: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{subject.subject}</span>
                        <span className="text-sm text-gray-500">
                          {subject.average.toFixed(1)}/20 ({subject.gradeCount} notes)
                        </span>
                      </div>
                      <Progress value={subject.average * 5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moyennes par trimestre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicSummary.termAverages.map((term: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{term.termName}</h4>
                        <span className="text-lg font-semibold">{term.average.toFixed(1)}/20</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {term.gradeCount} notes • {term.subjectCount} matières
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Matière</th>
                      <th className="text-left p-2">Évaluation</th>
                      <th className="text-left p-2">Note</th>
                      <th className="text-left p-2">Trimestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicSummary.recentGrades.map((grade: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(grade.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">{grade.assessment.subject.name}</td>
                        <td className="p-2">{grade.assessment.title}</td>
                        <td className="p-2">
                          <Badge variant={grade.score >= 10 ? "default" : "destructive"}>
                            {grade.score}/20
                          </Badge>
                        </td>
                        <td className="p-2">{grade.assessment.term?.name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{attendanceSummary.presentCount}</p>
                <p className="text-green-600">Présences</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{attendanceSummary.absentCount}</p>
                <p className="text-red-600">Absences</p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">{attendanceSummary.lateCount}</p>
                <p className="text-orange-600">Retards</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historique d'assiduité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Matière</th>
                      <th className="text-left p-2">Enseignant</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Remarques</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.recentRecords.map((record: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">{record.timetableEntry.subject.name}</td>
                        <td className="p-2">{record.timetableEntry.teacher.user.name}</td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              record.status === 'PRESENT' ? 'default' : 
                              record.status === 'LATE' ? 'secondary' : 'destructive'
                            }
                          >
                            {record.status === 'PRESENT' ? 'Présent' : 
                             record.status === 'LATE' ? 'En retard' : 'Absent'}
                          </Badge>
                        </td>
                        <td className="p-2">{record.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {(paymentSummary.totalDue / 100).toLocaleString()} FCFA
                </p>
                <p className="text-blue-600">Total dû</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {(paymentSummary.totalPaid / 100).toLocaleString()} FCFA
                </p>
                <p className="text-green-600">Total payé</p>
              </CardContent>
            </Card>
            
            <Card className={`${paymentSummary.balance > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <CardContent className="p-6 text-center">
                <AlertTriangle className={`h-12 w-12 mx-auto mb-2 ${paymentSummary.balance > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                <p className={`text-2xl font-bold ${paymentSummary.balance > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                  {(paymentSummary.balance / 100).toLocaleString()} FCFA
                </p>
                <p className={paymentSummary.balance > 0 ? 'text-red-600' : 'text-gray-600'}>
                  {paymentSummary.balance > 0 ? 'Solde restant' : 'Solde à jour'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Paiements récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Montant</th>
                      <th className="text-left p-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentSummary.recentPayments.map((payment: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">{payment.feeSchedule.itemName}</td>
                        <td className="p-2 font-medium">
                          {(payment.amountCents / 100).toLocaleString()} FCFA
                        </td>
                        <td className="p-2">
                          <Badge variant="default">Payé</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom complet</label>
                    <p className="font-medium">{studentData.user.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Matricule</label>
                      <p className="font-medium">{studentData.matricule || 'Non défini'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Numéro étudiant</label>
                      <p className="font-medium">{studentData.studentNumber || 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Genre</label>
                      <p className="font-medium">
                        {studentData.gender === 'MALE' ? 'Masculin' : studentData.gender === 'FEMALE' ? 'Féminin' : 'Non défini'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                      <p className="font-medium">
                        {studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toLocaleDateString('fr-FR') : 'Non définie'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                      <p className="font-medium">{studentData.placeOfBirth || 'Non défini'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nationalité</label>
                      <p className="font-medium">{studentData.nationality || 'Non définie'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Groupe sanguin</label>
                    <p className="font-medium">{studentData.bloodType || 'Non défini'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="font-medium">{studentData.user.email || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="font-medium">{studentData.user.phone || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Adresse</label>
                  <p className="font-medium">{studentData.address || 'Non définie'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Contact d'urgence</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact d'urgence</label>
                  <p className="font-medium">{studentData.emergencyContact || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Téléphone d'urgence</label>
                  <p className="font-medium">{studentData.emergencyPhone || 'Non défini'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5" />
                  <span>Informations scolaires</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEnrollment && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Classe actuelle</label>
                      <p className="font-medium">{currentEnrollment.classroom.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Niveau</label>
                      <p className="font-medium">{currentEnrollment.classroom.gradeLevel.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
                      <p className="font-medium">
                        {new Date(currentEnrollment.enrolledAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <Badge variant={currentEnrollment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {currentEnrollment.status}
                      </Badge>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">École précédente</label>
                  <p className="font-medium">{studentData.previousSchool || 'Non définie'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date d'inscription à l'école</label>
                  <p className="font-medium">
                    {studentData.enrollmentDate ? new Date(studentData.enrollmentDate).toLocaleDateString('fr-FR') : 'Non définie'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut général</label>
                  <Badge variant={studentData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {studentData.status === 'ACTIVE' ? 'Actif' : 
                     studentData.status === 'INACTIVE' ? 'Inactif' :
                     studentData.status === 'GRADUATED' ? 'Diplômé' :
                     studentData.status === 'TRANSFERRED' ? 'Transféré' : 'Non défini'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Statistiques</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-700">{student.statistics.totalGrades}</p>
                    <p className="text-gray-500">Notes</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-700">{student.statistics.totalPayments}</p>
                    <p className="text-gray-500">Paiements</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-700">{student.statistics.totalAttendanceRecords}</p>
                    <p className="text-gray-500">Présences</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-700">{student.statistics.parentsCount}</p>
                    <p className="text-gray-500">Parents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
