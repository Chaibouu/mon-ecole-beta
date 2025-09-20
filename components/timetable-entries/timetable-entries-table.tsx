"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Eye, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { deleteTimetableEntry } from "@/actions/timetable-entries";
import { toast } from "sonner";

interface TimetableEntriesTableProps {
  entries: any[];
  onDelete?: (id: string) => void;
}

const getDayLabel = (day: string) => {
  const dayMap: Record<string, string> = {
    "MONDAY": "Lundi",
    "TUESDAY": "Mardi",
    "WEDNESDAY": "Mercredi",
    "THURSDAY": "Jeudi",
    "FRIDAY": "Vendredi",
    "SATURDAY": "Samedi",
    "SUNDAY": "Dimanche",
  };
  return dayMap[day] || day;
};

export function TimetableEntriesTable({ entries, onDelete }: TimetableEntriesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée d'emploi du temps ?")) {
      setDeletingId(id);
      try {
        const result = await deleteTimetableEntry(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Entrée supprimée avec succès");
          onDelete?.(id);
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Enseignant</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Jour</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead>Salle</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Aucune entrée d'emploi du temps trouvée
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="font-medium">
                    {entry.teacherAssignment?.teacher?.user?.firstName} {entry.teacherAssignment?.teacher?.user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.teacherAssignment?.teacher?.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {entry.teacherAssignment?.subject?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {entry.teacherAssignment?.classroom?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.teacherAssignment?.classroom?.gradeLevel?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getDayLabel(entry.dayOfWeek)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">
                      {entry.startTime} - {entry.endTime}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {entry.room ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{entry.room}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/timetable-entries/${entry.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/timetable-entries/${entry.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === entry.id ? "Suppression..." : "Supprimer"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}




















