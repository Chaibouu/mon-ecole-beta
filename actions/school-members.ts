"use server";
import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

/**
 * Créer/lier un admin à une école
 */
export async function createSchoolAdmin(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/admins`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer la liste des admins d'une école
 */
export async function getSchoolAdmins(schoolId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/admins`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Modifier un admin d'école
 */
export async function updateSchoolAdmin(
  schoolId: string,
  userId: string,
  data: any
) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/admins?userId=${userId}`,
      "PUT",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Supprimer un admin d'école
 */
export async function deleteSchoolAdmin(schoolId: string, userId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/admins?userId=${userId}`,
      "DELETE"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un enseignant à une école
 */
export async function createSchoolTeacher(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/teachers`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un parent à une école
 */
export async function createSchoolParent(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/parents`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un élève à une école
 */
export async function createSchoolStudent(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/students`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister les membres d'une école avec leurs rôles
 */
export async function getSchoolMembers(schoolId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/members`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les utilisateurs disponibles (pour liaison)
 */
export async function getAvailableUsers() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les enseignants de l'école active
 */
export async function listTeachers() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les élèves de l'école active
 */
export async function listStudents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les élèves de l'école active avec leurs classes
 */
export async function listStudentsWithClassrooms() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students?includeClassrooms=true`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister toutes les classes de l'école active
 */
export async function listClassrooms() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/classrooms`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister les élèves d'une classe (par classroomId)
 */
export async function listStudentsByClassroom(classroomId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/classrooms/${classroomId}/students`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les parents de l'école active
 */
export async function listParents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

// Students (active school)
export async function getStudentById(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students/${id}`,
      "GET"
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function createStudent(input: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students`,
      "POST",
      input
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function updateStudent(id: string, data: Record<string, any>) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students/${id}`,
      "PATCH",
      data
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function deleteStudent(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students/${id}`,
      "DELETE"
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

// Parents (active school)
export async function getParentById(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents/${id}`,
      "GET"
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function createParent(input: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents`,
      "POST",
      input
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function updateParent(id: string, data: Record<string, any>) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents/${id}`,
      "PATCH",
      data
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

export async function deleteParent(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents/${id}`,
      "DELETE"
    );
    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Obtenir un enseignant par son ID
 */
export async function getTeacherById(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer un nouvel enseignant
 */
export async function createTeacher(input: any) {
  try {
    const subjectIds: string[] | undefined = input?.subjectIds;
    let payload: any;

    if (input?.existingUserId) {
      payload = {
        existingUserId: input.existingUserId,
        ...(Array.isArray(subjectIds) ? { subjectIds } : {}),
      };
    } else {
      const name = `${input?.firstName ?? ""} ${input?.lastName ?? ""}`.trim();
      const email = input?.email ?? "";
      const phone = input?.phone ?? "";
      const password =
        input?.password || `Tch_${Math.random().toString(36).slice(2, 8)}A1!`;

      payload = {
        user: { name, email, phone, password },
        // Ajouter tous les champs du profil professeur
        bio: input?.bio,
        employeeNumber: input?.employeeNumber,
        gender: input?.gender,
        dateOfBirth: input?.dateOfBirth,
        placeOfBirth: input?.placeOfBirth,
        nationality: input?.nationality,
        bloodType: input?.bloodType,
        address: input?.address,
        emergencyContact: input?.emergencyContact,
        emergencyPhone: input?.emergencyPhone,
        hireDate: input?.hireDate,
        qualification: input?.qualification,
        specialization: input?.specialization,
        experienceYears: input?.experienceYears,
        salary: input?.salary,
        status: input?.status,
        ...(Array.isArray(subjectIds) ? { subjectIds } : {}),
      };
    }

    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers`,
      "POST",
      payload
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Mettre à jour un enseignant
 */
export async function updateTeacher(id: string, data: Record<string, any>) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
      "PATCH",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Supprimer un enseignant
 */
export async function deleteTeacher(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
      "DELETE"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
