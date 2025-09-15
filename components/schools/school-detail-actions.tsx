"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import { softDeleteSchool } from "@/actions/schools";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SchoolDetailActionsProps {
  school: any;
}

export function SchoolDetailActions({ school }: SchoolDetailActionsProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      const result: any = await softDeleteSchool(school.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("École supprimée avec succès");
        setOpen(false);
        router.push("/schools");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l'école</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. L'école "{school.name}" sera désactivée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
