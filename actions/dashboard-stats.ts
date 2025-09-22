"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";
import { listClassrooms } from "@/actions/classrooms";
import { listEnrollments } from "@/actions/enrollments";
import { listSubjects } from "@/actions/subjects";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalSubjects: number;
  totalParents: number;
  totalEnrollments: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
  createdAt: string;
}

/**
 * Récupère les statistiques du dashboard pour l'école active
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Récupérer les données en parallèle en utilisant les actions existantes
    const [
      studentsResult,
      teachersResult,
      classroomsResult,
      subjectsResult,
      parentsResult,
      enrollmentsResult,
    ] = await Promise.all([
      makeAuthenticatedRequest(`${API_BASE}/schools/active/students`, "GET"),
      makeAuthenticatedRequest(`${API_BASE}/schools/active/teachers`, "GET"),
      listClassrooms(),
      listSubjects(),
      makeAuthenticatedRequest(`${API_BASE}/schools/active/parents`, "GET"),
      listEnrollments(),
    ]);

    // Log détaillé pour le débogage
    // if (process.env.NODE_ENV === "development") {
    //   console.log("=== DASHBOARD DEBUG ===");
    //   console.log("Students Result:", JSON.stringify(studentsResult, null, 2));
    //   console.log("Teachers Result:", JSON.stringify(teachersResult, null, 2));
    //   console.log(
    //     "Classrooms Result:",
    //     JSON.stringify(classroomsResult, null, 2)
    //   );
    //   console.log("Subjects Result:", JSON.stringify(subjectsResult, null, 2));
    //   console.log("Parents Result:", JSON.stringify(parentsResult, null, 2));
    //   console.log(
    //     "Enrollments Result:",
    //     JSON.stringify(enrollmentsResult, null, 2)
    //   );
    //   console.log("=== END DEBUG ===");
    // }

    // Gérer les erreurs individuelles et extraire les données des objets de réponse
    const totalStudents = Array.isArray(studentsResult?.students)
      ? studentsResult.students.length
      : Array.isArray(studentsResult)
        ? studentsResult.length
        : 0;
    const totalTeachers = Array.isArray(teachersResult?.teachers)
      ? teachersResult.teachers.length
      : Array.isArray(teachersResult)
        ? teachersResult.length
        : 0;
    const totalClassrooms = Array.isArray(classroomsResult?.classrooms)
      ? classroomsResult.classrooms.length
      : Array.isArray(classroomsResult)
        ? classroomsResult.length
        : 0;
    const totalSubjects = Array.isArray(subjectsResult?.subjects)
      ? subjectsResult.subjects.length
      : Array.isArray(subjectsResult)
        ? subjectsResult.length
        : 0;
    const totalParents = Array.isArray(parentsResult)
      ? parentsResult.length
      : 0;
    const totalEnrollments = Array.isArray(enrollmentsResult?.enrollments)
      ? enrollmentsResult.enrollments.length
      : Array.isArray(enrollmentsResult)
        ? enrollmentsResult.length
        : 0;

    // Générer des activités récentes basées sur les données réelles
    const recentActivities: Activity[] = [];

    // Ajouter des activités basées sur les données récentes
    const studentsArray = Array.isArray(studentsResult?.students)
      ? studentsResult.students
      : Array.isArray(studentsResult)
        ? studentsResult
        : [];
    if (studentsArray.length > 0) {
      const recentStudents = studentsArray.slice(-3);
      recentStudents.forEach((student: any) => {
        recentActivities.push({
          id: `student-${student.id}`,
          type: "student",
          message: `${student.user?.name || "Nouvel étudiant"} a été ajouté`,
          time: getRelativeTime(student.createdAt),
          icon: "Users",
          createdAt: student.createdAt,
        });
      });
    }

    const teachersArray = Array.isArray(teachersResult?.teachers)
      ? teachersResult.teachers
      : Array.isArray(teachersResult)
        ? teachersResult
        : [];
    if (teachersArray.length > 0) {
      const recentTeachers = teachersArray.slice(-2);
      recentTeachers.forEach((teacher: any) => {
        recentActivities.push({
          id: `teacher-${teacher.id}`,
          type: "teacher",
          message: `Ens. ${teacher.user?.name || "Nouvel enseignant"} a rejoint l'équipe`,
          time: getRelativeTime(teacher.createdAt),
          icon: "GraduationCap",
          createdAt: teacher.createdAt,
        });
      });
    }

    const enrollmentsArray = Array.isArray(enrollmentsResult?.enrollments)
      ? enrollmentsResult.enrollments
      : Array.isArray(enrollmentsResult)
        ? enrollmentsResult
        : [];
    if (enrollmentsArray.length > 0) {
      const recentEnrollments = enrollmentsArray.slice(-2);
      recentEnrollments.forEach((enrollment: any) => {
        recentActivities.push({
          id: `enrollment-${enrollment.id}`,
          type: "enrollment",
          message: `Nouvelle inscription en ${enrollment.classroom?.name || "classe"}`,
          time: getRelativeTime(enrollment.createdAt),
          icon: "BookOpenCheck",
          createdAt: enrollment.createdAt,
        });
      });
    }

    // Trier les activités par date (plus récente en premier)
    recentActivities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      totalStudents,
      totalTeachers,
      totalClassrooms,
      totalSubjects,
      totalParents,
      totalEnrollments,
      recentActivities: recentActivities.slice(0, 5), // Limiter à 5 activités
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);

    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClassrooms: 0,
      totalSubjects: 0,
      totalParents: 0,
      totalEnrollments: 0,
      recentActivities: [],
    };
  }
}

/**
 * Convertit une date en temps relatif (ex: "Il y a 2 heures")
 */
function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    } else if (diffInHours > 0) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else {
      return "À l'instant";
    }
  } catch {
    return "Récemment";
  }
}
