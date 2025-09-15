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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit, Trash2, DollarSign, Users, Layers, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createFeeSchedule, updateFeeSchedule, deleteFeeSchedule, listPayments, createPayment, listFeeSchedules } from "@/actions/school-fees";

type FeeSchedule = {
  id: string;
  itemName: string;
  amountCents: number;
  dueDate: string | null;
  gradeLevel?: { id: string; name: string; } | null;
  classroom?: { id: string; name: string; gradeLevel?: { name: string; } } | null;
  isInstallment?: boolean;
  parentFeeId?: string | null;
  installmentOrder?: number | null;
  installments?: FeeSchedule[];
};

type Analytics = {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  pendingAmount: number;
  overdueAmount: number;
};

interface SchoolFeesClientProps {
  initialFeeSchedules: FeeSchedule[];
  gradeLevels: Array<{ id: string; name: string; }>;
  classrooms: Array<{ id: string; name: string; gradeLevel?: { id: string; name: string; } }>;
  analytics: Analytics;
}

export default function   SchoolFeesClient({
  initialFeeSchedules,
  gradeLevels,
  classrooms,
  analytics,
}: SchoolFeesClientProps) {
  const [feeSchedules, setFeeSchedules] = useState(initialFeeSchedules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeeSchedule, setEditingFeeSchedule] = useState<FeeSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tab states
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feeScheduleToDelete, setFeeScheduleToDelete] = useState<FeeSchedule | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    gradeLevelId: "",
    search: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    itemName: "",
    amountCents: 0,
    gradeLevelId: "",
    classroomId: "",
    dueDate: "",
    installments: [] as Array<{
      name: string;
      amountCents: number;
      dueDate: string;
    }>,
  });


  // Filter fee schedules
  const filteredFeeSchedules = useMemo(() => {
    return feeSchedules.filter(schedule => {
      if (filters.gradeLevelId && schedule.gradeLevel?.id !== filters.gradeLevelId) {
        return false;
      }
      if (filters.search && !schedule.itemName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [feeSchedules, filters]);

  // Grouper les structures principales et leurs tranches
  const groupedFeeSchedules = useMemo(() => {
    const mainSchedules = filteredFeeSchedules.filter(schedule => !schedule.itemName.includes(' - '));
    const installmentSchedules = filteredFeeSchedules.filter(schedule => schedule.itemName.includes(' - '));
    
    return mainSchedules.map(main => {
      const installments = installmentSchedules.filter(inst => 
        inst.itemName.startsWith(main.itemName + ' - ')
      );
      return {
        ...main,
        installments
      };
    });
  }, [filteredFeeSchedules]);

  // Classroom options for SearchableSelect
  const classroomOptions = useMemo(() =>
    classrooms.map(classroom => ({
      value: classroom.id,
      label: `${classroom.name}${classroom.gradeLevel?.name ? ` (${classroom.gradeLevel.name})` : ""}`
    })), [classrooms]
  );

  const resetForm = () => {
    setFormData({
      itemName: "",
      amountCents: 0,
      gradeLevelId: "",
      classroomId: "",
      dueDate: "",
      installments: [],
    });
    setEditingFeeSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || formData.amountCents <= 0) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!formData.gradeLevelId) {
      toast.error("Veuillez sélectionner un niveau scolaire");
      return;
    }

    // Validation des tranches
    if (formData.installments.length > 0) {
      const totalInstallments = formData.installments.reduce((sum, inst) => sum + inst.amountCents, 0);
      if (totalInstallments !== formData.amountCents) {
        toast.error(`La somme des tranches (${(totalInstallments / 100).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        })}) doit être égale au montant total (${(formData.amountCents / 100).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        })})`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const data = {
        itemName: formData.itemName,
        amountCents: formData.amountCents,
        gradeLevelId: formData.gradeLevelId,
        dueDate: formData.dueDate || undefined,
        installments: formData.installments.length > 0 ? formData.installments : undefined,
      };

      if (editingFeeSchedule) {
        const result: any = await updateFeeSchedule(editingFeeSchedule.id, data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Structure de frais mise à jour avec succès");
          setFeeSchedules(prev => 
            prev.map(fs => fs.id === editingFeeSchedule.id ? result.feeSchedule : fs)
          );
          resetForm();
          setIsCreateDialogOpen(false);
        }
      } else {
        const result: any = await createFeeSchedule(data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          // Recharger toutes les structures pour inclure les tranches créées
          try {
            const refreshResult: any = await listFeeSchedules();
            if (refreshResult?.feeSchedules) {
              setFeeSchedules(refreshResult.feeSchedules);
            }
          } catch (refreshError) {
            // Si le rechargement échoue, ajouter au moins l'élément principal
            setFeeSchedules(prev => [result.feeSchedule, ...prev]);
          }
            toast.success("Frais scolaires créés avec succès");
          resetForm();
          setIsCreateDialogOpen(false);
        }
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (feeSchedule: FeeSchedule) => {
    // Détecter si c'est une tranche (contient ' - ' dans le nom ou isInstallment = true)
    const isInstallment = feeSchedule.isInstallment || feeSchedule.itemName.includes(' - ');
    
    // Convertir les tranches existantes au format du formulaire
    const existingInstallments = (feeSchedule.installments || []).map(installment => ({
      name: installment.itemName,
      amountCents: installment.amountCents,
      dueDate: installment.dueDate ? new Date(installment.dueDate).toISOString().split('T')[0] : "",
    }));
    
    setFormData({
      itemName: feeSchedule.itemName,
      amountCents: feeSchedule.amountCents,
      gradeLevelId: feeSchedule.gradeLevel?.id || "",
      classroomId: feeSchedule.classroom?.id || "",
      dueDate: feeSchedule.dueDate ? new Date(feeSchedule.dueDate).toISOString().split('T')[0] : "",
      installments: isInstallment ? [] : existingInstallments, // Les tranches ne peuvent pas avoir de sous-tranches
    });
    setEditingFeeSchedule(feeSchedule);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteClick = (feeSchedule: FeeSchedule) => {
    setFeeScheduleToDelete(feeSchedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feeScheduleToDelete) return;

    try {
      const result: any = await deleteFeeSchedule(feeScheduleToDelete.id);
      if (result.success) {
        setFeeSchedules(prev => prev.filter(s => s.id !== feeScheduleToDelete.id));
        toast.success("Frais scolaires supprimés avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setFeeScheduleToDelete(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ces frais scolaires ?")) {
      return;
    }

    try {
      const result: any = await deleteFeeSchedule(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Frais scolaires supprimés avec succès");
        setFeeSchedules(prev => prev.filter(fs => fs.id !== id));
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
    }
  };


  const addInstallment = () => {
    setFormData(prev => ({
      ...prev,
      installments: [
        ...prev.installments,
        { name: "", amountCents: 0, dueDate: "" }
      ]
    }));
  };   {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ces frais scolaires "{feeScheduleToDelete?.itemName}" ?
              <br />
              <span className="font-medium text-destructive">
                Cette action est irréversible et supprimera également tous les paiements associés.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  const removeInstallment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index)
    }));
  };

  const updateInstallment = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.map((installment, i) =>
        i === index ? { ...installment, [field]: value } : installment
      )
    }));
  };

  // Load payments
  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const result: any = await listPayments({
        // Les filtres par niveau/classe ne sont pas supportés directement par l'API payments
        // On récupère tous les paiements pour l'instant
      });
      setPayments(result.payments || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoadingPayments(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="fee-schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fee-schedules">Frais scolaires</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="fee-schedules" className="space-y-6">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveaux frais scolaires
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFeeSchedule ? "Modifier" : "Créer"} une frais de scolarité
                    </DialogTitle>
                    <DialogDescription>
                      Définissez les frais par niveau ou classe avec des tranches de paiement optionnelles
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemName">Nom de l'élément *</Label>
                        <Input
                          id="itemName"
                          value={formData.itemName}
                          onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                          placeholder="Ex: Frais de scolarité T1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="amountCents">Montant (FCFA) *</Label>
                        <Input
                          id="amountCents"
                          type="number"
                          value={formData.amountCents / 100}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            amountCents: Math.round(parseFloat(e.target.value || "0") * 100)
                          }))}
                          placeholder="50000"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    {/* Target Selection */}
                    <div>
                      <Label htmlFor="gradeLevelId">Niveau scolaire *</Label>
                      <Select 
                        value={formData.gradeLevelId || "placeholder"} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          gradeLevelId: value === "placeholder" ? "" : value,
                          classroomId: "" // Reset classroom when grade level changes
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>Sélectionnez un niveau</SelectItem>
                          {gradeLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600 mt-1">
                        Les frais s'appliquent à tous les élèves de ce niveau (ex: toutes les classes de 6ème)
                      </p>
                    </div>

                    {/* Due Date */}
                    <div>
                      <Label htmlFor="dueDate">Date d'échéance (optionnelle)</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>

                    {/* Installments - Seulement pour les structures principales */}
                    {!editingFeeSchedule?.itemName.includes(' - ') && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Tranches de paiement (optionnel)</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addInstallment}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une tranche
                          </Button>
                        </div>
                      
                      {formData.installments.map((installment, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-3 border rounded">
                          <div className="col-span-4">
                            <Input
                              placeholder="Nom de la tranche"
                              value={installment.name}
                              onChange={(e) => updateInstallment(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              placeholder="Montant"
                              value={installment.amountCents / 100}
                              onChange={(e) => updateInstallment(index, "amountCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="col-span-4">
                            <Input
                              type="date"
                              value={installment.dueDate}
                              onChange={(e) => updateInstallment(index, "dueDate", e.target.value)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeInstallment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}

                    {/* Message informatif pour les tranches */}
                    {editingFeeSchedule?.itemName.includes(' - ') && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Modification d'une tranche
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Les tranches ne peuvent pas avoir de sous-tranches. 
                          Vous ne pouvez modifier que le nom, le montant et la date d'échéance.
                        </p>
                      </div>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Enregistrement..." : editingFeeSchedule ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Recherche</Label>
              <Input
                id="search"
                placeholder="Rechercher par nom..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="filterGradeLevel">Niveau</Label>
              <Select 
                value={filters.gradeLevelId || "all"} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, gradeLevelId: value === "all" ? "" : value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {gradeLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fee Schedules List */}
          <div className="grid gap-4">
            {groupedFeeSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{schedule.itemName}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {schedule.gradeLevel && (
                          <Badge variant="secondary">
                            {schedule.gradeLevel.name}
                          </Badge>
                        )}
                        {schedule.installments && schedule.installments.length > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {schedule.installments.length} tranche{schedule.installments.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(schedule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(schedule)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      {(schedule.amountCents / 100).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF'
                      })}
                    </div>
                    {schedule.dueDate && (
                      <div className="text-sm text-muted-foreground">
                        Échéance: {new Date(schedule.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Installments Accordion */}
                  {schedule.installments && schedule.installments.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="installments">
                        <AccordionTrigger className="text-sm font-medium">
                          Voir les tranches de paiement ({schedule.installments.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {schedule.installments.map((installment: any) => (
                              <div key={installment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium text-sm">
                                    {installment.itemName.replace(schedule.itemName + ' - ', '')}
                                  </span>
                                  {installment.dueDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Échéance: {new Date(installment.dueDate).toLocaleDateString('fr-FR')}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-600">
                                    {(installment.amountCents / 100).toLocaleString('fr-FR', {
                                      style: 'currency',
                                      currency: 'XOF'
                                    })}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(installment)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(installment)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {groupedFeeSchedules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune frais de scolarité trouvée
            </div>
          )}
        </TabsContent>


        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <Button onClick={loadPayments} disabled={loadingPayments}>
                    {loadingPayments ? "Chargement..." : "Charger les paiements"}
                  </Button>
                </div>

                {/* Payments List */}
                {payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map((payment: any) => (
                      <Card key={payment.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{payment.student?.user?.name}</p>
                            <p className="text-sm text-gray-600">
                              {payment.feeSchedule?.itemName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                            </p>
                            {payment.reference && (
                              <p className="text-xs text-gray-500">
                                Réf: {payment.reference}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {(payment.amountCents / 100).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'XOF'
                              })}
                            </p>
                            {payment.method && (
                              <Badge variant="outline">{payment.method}</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {loadingPayments ? "Chargement..." : "Aucun paiement trouvé"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ces frais scolaires "{feeScheduleToDelete?.itemName}" ?
              <br />
              <span className="font-medium text-destructive">
                Cette action est irréversible et supprimera également tous les paiements associés.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
