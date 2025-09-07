// Script pour générer des données de test pour les présences
// À exécuter manuellement si nécessaire

import { db } from "@/lib/db";

export async function seedAttendanceData() {
  try {
    // Récupérer quelques étudiants et cours existants
    const students = await db.studentProfile.findMany({
      take: 10,
      include: { user: true },
    });

    const timetableEntries = await db.timetableEntry.findMany({
      take: 5,
      include: { classroom: true, subject: true },
    });

    if (students.length === 0 || timetableEntries.length === 0) {
      console.log(
        "Pas assez de données de base (étudiants/cours) pour créer des présences"
      );
      return;
    }

    const statuses = ["PRESENT", "ABSENT", "LATE", "SICK"] as const;
    const attendanceRecords = [];

    // Générer des données pour les 30 derniers jours
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Pour chaque cours
      for (const timetableEntry of timetableEntries.slice(0, 2)) {
        // Pour chaque étudiant (80% de chance d'avoir un enregistrement)
        for (const student of students.slice(0, 5)) {
          if (Math.random() > 0.8) continue; // 20% chance de ne pas avoir d'enregistrement

          // 85% présent, 10% absent, 3% retard, 2% malade
          let status = "PRESENT";
          const rand = Math.random();
          if (rand > 0.98) status = "SICK";
          else if (rand > 0.95) status = "LATE";
          else if (rand > 0.85) status = "ABSENT";

          attendanceRecords.push({
            studentId: student.id,
            date: date,
            status: status as any,
            timetableEntryId: timetableEntry.id,
            recordedById: null,
            notes:
              status !== "PRESENT"
                ? `Enregistrement automatique - ${status}`
                : null,
          });
        }
      }
    }

    // Insérer les données par batch
    console.log(
      `Création de ${attendanceRecords.length} enregistrements de présence...`
    );

    for (let i = 0; i < attendanceRecords.length; i += 50) {
      const batch = attendanceRecords.slice(i, i + 50);
      await db.attendanceRecord.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    console.log("Données de présence créées avec succès !");

    // Afficher un résumé
    const summary = await db.attendanceRecord.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    console.log("Résumé des données créées:");
    summary.forEach(item => {
      console.log(`- ${item.status}: ${item._count.id} enregistrements`);
    });
  } catch (error) {
    console.error("Erreur lors de la création des données de test:", error);
  }
}

// Fonction pour nettoyer les données de test
export async function cleanupAttendanceData() {
  try {
    const result = await db.attendanceRecord.deleteMany({
      where: {
        notes: {
          startsWith: "Enregistrement automatique",
        },
      },
    });
    console.log(`${result.count} enregistrements de test supprimés.`);
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
  }
}
