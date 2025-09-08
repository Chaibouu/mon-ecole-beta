"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { createStudentPayment } from "@/actions/student-payments";
import { formatCurrency } from "@/lib/format";

interface CreatePaymentDialogProps {
  studentId: string;
  unpaidFeeSchedules: any[];
  onPaymentCreated: () => void;
  gradeLevelId?: string;
  studentGradeLevel?: { id: string; name: string };
}

export function CreatePaymentDialog({ studentId, unpaidFeeSchedules, onPaymentCreated, gradeLevelId, studentGradeLevel }: CreatePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    feeScheduleId: "",
    amountCents: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feeScheduleId || !formData.amountCents) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      const result = await createStudentPayment({
        studentId,
        feeScheduleId: formData.feeScheduleId,
        amountCents: formData.amountCents,
        method: "CASH", // Par défaut en espèces
        notes: formData.notes || undefined,
      });
      
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Paiement enregistré avec succès");
      setOpen(false);
      setFormData({
        feeScheduleId: "",
        amountCents: 0,
        notes: "",
      });
      onPaymentCreated();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setLoading(false);
    }
  };


  // Utiliser uniquement les unpaidFeeSchedules qui sont déjà filtrées par l'API
  // et filtrer selon le niveau de l'élève si nécessaire
  const availableFeeSchedules = unpaidFeeSchedules.filter(fs => {
    // Si on a le niveau de l'élève, filtrer par niveau
    if (studentGradeLevel && fs.gradeLevel && fs.gradeLevel.id !== studentGradeLevel.id) {
      return false;
    }
    return true;
  });
  
  // Grouper par frais principal pour une meilleure organisation
  const groupedFeeSchedules = new Map();
  availableFeeSchedules.forEach(fs => {
    // Détecter les tranches legacy (sans parentFeeId mais avec libellé "Main - Tranche")
    let groupKey = fs.parentFeeId || fs.id;
    let isLegacyInstallment = false;
    if (!fs.parentFeeId && typeof fs.itemName === "string") {
      const sepIndex = fs.itemName.indexOf(" - ");
      if (sepIndex > -1) {
        const baseName = fs.itemName.slice(0, sepIndex);
        const main = availableFeeSchedules.find(x => !x.parentFeeId && x.itemName === baseName);
        if (main) {
          groupKey = main.id;
          isLegacyInstallment = true;
        }
      }
    }

    if (!groupedFeeSchedules.has(groupKey)) {
      groupedFeeSchedules.set(groupKey, {
        mainFee: null,
        installments: []
      });
    }
    const group = groupedFeeSchedules.get(groupKey);

    // Classer dans la bonne catégorie
    if (fs.isInstallment || isLegacyInstallment) {
      group.installments.push({ ...fs, isInstallment: true });
    } else {
      group.mainFee = fs;
    }
  });
  
  const selectedFeeSchedule = availableFeeSchedules.find(fs => fs.id === formData.feeScheduleId);

  // Construire des options en exposant le frais principal (paiement complet)
  // et chaque tranche non totalement payée
  const feeScheduleOptions: Array<{ value: string; label: string; meta?: any }> = [];
  // Debug
  // console.log('[CREATE_PAYMENT] availableFeeSchedules:', availableFeeSchedules);
  groupedFeeSchedules.forEach((group: any, key: string) => {
    const main = group.mainFee;
    const installments = group.installments as any[];

    // Option: paiement complet (frais principal) si non totalement payé
    if (main) {
      const remaining = typeof main.remainingAmount === "number"
        ? main.remainingAmount
        : (main.amountCents - (main.totalPaid || 0));
      if (remaining > 0) {
        let label = `${main.itemName} - ${formatCurrency(main.amountCents)} (Paiement complet)`;
        if (main.dueDate) {
          label += ` - Échéance: ${format(new Date(main.dueDate), "dd/MM/yyyy")}`;
        }
        feeScheduleOptions.push({ value: main.id, label, meta: { remaining } });
      }
    }

    // Options: tranches avec montant restant
    installments?.forEach(inst => {
      const remaining = typeof inst.remainingAmount === "number"
        ? inst.remainingAmount
        : (inst.amountCents - (inst.totalPaid || 0));
      if (remaining > 0) {
        let label = `${inst.itemName} - ${formatCurrency(inst.amountCents)} (Tranche${inst.installmentOrder ? ` ${inst.installmentOrder}` : ""})`;
        if (inst.dueDate) {
          label += ` - Échéance: ${format(new Date(inst.dueDate), "dd/MM/yyyy")}`;
        }
        feeScheduleOptions.push({ value: inst.id, label, meta: { remaining } });
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={unpaidFeeSchedules.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau paiement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Enregistrer un paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau paiement pour cet étudiant
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
                        <Label htmlFor="feeScheduleId">Frais de scolarité *</Label>
            <SearchableSelect
              options={feeScheduleOptions}
              value={formData.feeScheduleId ? { 
                value: formData.feeScheduleId, 
                label: feeScheduleOptions.find(opt => opt.value === formData.feeScheduleId)?.label || ""
              } : null}
              onChange={(option) => {
                const feeSchedule = availableFeeSchedules.find(fs => fs.id === option?.value);
                setFormData(prev => ({ 
                  ...prev, 
                  feeScheduleId: option?.value || "",
                  amountCents: feeSchedule?.amountCents || 0
                }));
              }}
              placeholder="Sélectionner les frais de scolarité..."
            />
            {feeScheduleOptions.length > 0 ? (
              <div className="text-sm text-gray-500 space-y-1">
                <p>Sélectionnez les frais que l'élève souhaite payer</p>
                <p className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                  💡 <strong>Astuce:</strong> Vous pouvez payer en une fois (paiement complet) ou par tranches selon vos préférences
                </p>
              </div>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border">
                Aucun frais de scolarité disponible pour ce niveau ou tous les frais sont déjà payés
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountCents">Montant payé (FCFA) *</Label>
            <Input
              id="amountCents"
              type="number"
              min="1"
              value={formData.amountCents / 100}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                amountCents: Math.round(parseFloat(e.target.value || "0") * 100)
              }))}
              placeholder="0"
              className="text-lg font-medium"
            />
            {selectedFeeSchedule && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Montant total des frais:</span> {formatCurrency(selectedFeeSchedule.amountCents)}
                </p>
                {formData.amountCents > 0 && formData.amountCents < selectedFeeSchedule.amountCents && (
                  <p className="text-sm text-amber-700 mt-1">
                    <span className="font-medium">Reste à payer:</span> {formatCurrency(selectedFeeSchedule.amountCents - formData.amountCents)}
                  </p>
                )}
                {formData.amountCents >= selectedFeeSchedule.amountCents && (
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    ✓ Frais entièrement payés
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires sur le paiement..."
              rows={3}
            />
          </div>

          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informations automatiques</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <span className="font-medium">Mode de paiement:</span> Espèces</p>
              <p>• <span className="font-medium">Date de paiement:</span> {format(new Date(), "dd/MM/yyyy à HH:mm")}</p>
                          <p>• <span className="font-medium">Échéance:</span> Selon les frais de scolarité sélectionnés</p>
            </div>
          </div> */}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.feeScheduleId || !formData.amountCents}>
              {loading ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
