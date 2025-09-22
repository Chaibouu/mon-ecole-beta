"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { listFeeSchedules, createPayment } from "@/actions/school-fees";
import { formatCurrency } from "@/lib/format";

interface CreatePaymentDirectDialogProps {
  studentId: string;
  onPaymentCreated: () => void;
}

interface FeeSchedule {
  id: string;
  itemName: string;
  amountCents: number;
  gradeLevel?: {
    name: string;
  };
  classroom?: {
    name: string;
  };
}

const paymentMethods = [
  { value: "CASH", label: "Espèces" },
  { value: "BANK_TRANSFER", label: "Virement bancaire" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CHECK", label: "Chèque" },
  { value: "CARD", label: "Carte bancaire" },
];

export function CreatePaymentDirectDialog({ studentId, onPaymentCreated }: CreatePaymentDirectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([]);
  const [formData, setFormData] = useState({
    feeScheduleId: "",
    amountCents: null as number | null,
    method: "CASH",
    reference: "",
    paidAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadFeeSchedules();
    }
  }, [open]);

  const loadFeeSchedules = async () => {
    try {
      const response = await listFeeSchedules();
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      setFeeSchedules(response.feeSchedules || []);
    } catch (error) {
      console.error("Error loading fee schedules:", error);
      toast.error("Erreur lors du chargement des structures de frais");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feeScheduleId || !formData.amountCents) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      const result = await createPayment({
        studentId,
        feeScheduleId: formData.feeScheduleId,
        amountCents: formData.amountCents,
        method: formData.method,
        reference: formData.reference || undefined,
        paidAt: formData.paidAt,
        dueDate: formData.dueDate || undefined,
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
        amountCents: null,
        method: "CASH",
        reference: "",
        paidAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        dueDate: "",
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


  const feeScheduleOptions = feeSchedules.map(fs => ({
    value: fs.id,
    label: `${fs.itemName} - ${formatCurrency(fs.amountCents)} ${
      fs.gradeLevel ? `(${fs.gradeLevel.name})` : ""
    }${fs.classroom ? ` - ${fs.classroom.name}` : ""}`,
  }));

  const selectedFeeSchedule = feeSchedules.find(fs => fs.id === formData.feeScheduleId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un paiement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Enregistrer un nouveau paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrez un paiement effectué par l'étudiant pour les frais de scolarité
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feeScheduleId">Frais de scolarité *</Label>
            <SearchableSelect
              options={feeScheduleOptions}
              value={formData.feeScheduleId ? { 
                value: formData.feeScheduleId, 
                label: feeScheduleOptions.find(opt => opt.value === formData.feeScheduleId)?.label || ""
              } : null}
              onChange={(option) => {
                const feeSchedule = feeSchedules.find(fs => fs.id === option?.value);
                setFormData(prev => ({ 
                  ...prev, 
                  feeScheduleId: option?.value || "",
                  amountCents: feeSchedule?.amountCents || null
                }));
              }}
              placeholder="Sélectionner les frais de scolarité..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountCents">Montant payé (FCFA) *</Label>
              <Input
                id="amountCents"
                type="number"
                min="1"
                value={formData.amountCents ? formData.amountCents / 100 : ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  amountCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null
                }))}
                placeholder=""
              />
              {selectedFeeSchedule && (
                <p className="text-sm text-gray-600">
                  Montant total: <span className="font-medium">{formatCurrency(selectedFeeSchedule.amountCents)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Méthode de paiement *</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paidAt">Date et heure de paiement *</Label>
              <Input
                id="paidAt"
                type="datetime-local"
                value={formData.paidAt}
                onChange={(e) => setFormData(prev => ({ ...prev, paidAt: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance (optionnel)</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence de paiement (optionnel)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Numéro de reçu, référence de transaction..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
