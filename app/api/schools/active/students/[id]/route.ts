import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";
import { StudentUpdateSchema } from "@/schemas/membership";

const includeUser = { user: true } as const;

// GET /api/schools/active/students/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    // Essayer de trouver l'étudiant par studentProfileId d'abord
    let student = await db.studentProfile.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
        enrollments: {
          include: {
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
            academicYear: true,
          },
          orderBy: {
            enrolledAt: "desc",
          },
        },
        payments: {
          include: {
            feeSchedule: {
              include: {
                gradeLevel: true,
                classroom: true,
                term: true,
              },
            },
          },
          orderBy: {
            paidAt: "desc",
          },
        },
        grades: {
          include: {
            assessment: {
              include: {
                subject: true,
                classroom: true,
                term: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Si pas trouvé, essayer par userId
    if (!student) {
      student = await db.studentProfile.findFirst({
        where: { userId: id, schoolId },
        include: {
          user: true,
          enrollments: {
            include: {
              classroom: {
                include: {
                  gradeLevel: true,
                },
              },
              academicYear: true,
            },
            orderBy: {
              enrolledAt: "desc",
            },
          },
          payments: {
            include: {
              feeSchedule: {
                include: {
                  gradeLevel: true,
                  classroom: true,
                  term: true,
                },
              },
            },
            orderBy: {
              paidAt: "desc",
            },
          },
          grades: {
            include: {
              assessment: {
                include: {
                  subject: true,
                  classroom: true,
                  term: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    }

    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Récupérer l'inscription actuelle
    const currentEnrollment = student.enrollments.find(
      e => e.status === "ACTIVE"
    );

    // Récupérer les enregistrements d'assiduité
    const attendanceRecords = await db.attendanceRecord.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        timetableEntry: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: true,
              },
            },
            classroom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculer les statistiques de paiement
    const totalPaid = student.payments.reduce(
      (sum: number, payment: any) => sum + payment.amountCents,
      0
    );

    // Calculer le total dû (simplifié)
    let totalDue = 0;
    if (currentEnrollment) {
      const applicableFees = await db.feeSchedule.findMany({
        where: {
          schoolId,
          OR: [
            {
              gradeLevelId: currentEnrollment.classroom.gradeLevelId,
              classroomId: null,
            },
            { classroomId: currentEnrollment.classroomId },
          ],
        },
      });

      totalDue = applicableFees.reduce(
        (sum: number, fee: any) => sum + fee.amountCents,
        0
      );
    }

    const balance = totalDue - totalPaid;

    // Calculer les statistiques d'assiduité
    const attendanceStats = {
      totalRecords: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === "PRESENT")
        .length,
      absentCount: attendanceRecords.filter(r => r.status === "ABSENT").length,
      lateCount: attendanceRecords.filter(r => r.status === "LATE").length,
      attendanceRate:
        attendanceRecords.length > 0
          ? (attendanceRecords.filter(r => r.status === "PRESENT").length /
              attendanceRecords.length) *
            100
          : 0,
    };

    // Calculer les statistiques de notes
    const gradeStats = {
      totalGrades: student.grades.length,
      averageScore:
        student.grades.length > 0
          ? student.grades.reduce(
              (sum: number, grade: any) => sum + grade.score,
              0
            ) / student.grades.length
          : 0,
      maxScore:
        student.grades.length > 0
          ? Math.max(...student.grades.map((g: any) => g.score))
          : 0,
      minScore:
        student.grades.length > 0
          ? Math.min(...student.grades.map((g: any) => g.score))
          : 0,
    };

    // Grouper les notes par matière
    const gradesBySubject = student.grades.reduce((acc: any, grade: any) => {
      const subjectName = grade.assessment.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(grade);
      return acc;
    }, {});

    // Calculer les moyennes par matière
    const subjectAverages = Object.entries(gradesBySubject).map(
      ([subject, grades]: [string, any]) => ({
        subject,
        average:
          grades.reduce((sum: number, grade: any) => sum + grade.score, 0) /
          grades.length,
        gradeCount: grades.length,
      })
    );

    // Grouper les notes par trimestre
    const gradesByTerm = student.grades.reduce((acc: any, grade: any) => {
      const termName = grade.assessment.term?.name || "Non défini";
      if (!acc[termName]) {
        acc[termName] = [];
      }
      acc[termName].push(grade);
      return acc;
    }, {});

    // Calculer les moyennes par trimestre
    const termAverages = Object.entries(gradesByTerm).map(
      ([termName, grades]: [string, any]) => ({
        termName,
        average:
          grades.reduce((sum: number, grade: any) => sum + grade.score, 0) /
          grades.length,
        gradeCount: grades.length,
        subjectCount: new Set(grades.map((g: any) => g.assessment.subject.name))
          .size,
      })
    );

    return NextResponse.json({
      student,
      currentEnrollment: currentEnrollment || null,
      allEnrollments: student.enrollments,
      paymentSummary: {
        totalDue,
        totalPaid,
        balance,
        recentPayments: student.payments.slice(0, 5),
      },
      attendanceSummary: {
        ...attendanceStats,
        recentRecords: attendanceRecords.slice(0, 10),
      },
      academicSummary: {
        ...gradeStats,
        subjectAverages,
        termAverages,
        overallAverage: gradeStats.averageScore,
        recentGrades: student.grades.slice(0, 10),
        gradesBySubject,
        gradesByTerm,
      },
      statistics: {
        totalEnrollments: student.enrollments.length,
        totalPayments: student.payments.length,
        totalGrades: student.grades.length,
        totalAttendanceRecords: attendanceRecords.length,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active/students/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const payload = await req.json();
    const parsed = StudentUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    // Essayer de trouver l'étudiant par studentProfileId d'abord
    let student = await db.studentProfile.findFirst({
      where: { id, schoolId },
    });

    // Si pas trouvé, essayer par userId
    if (!student) {
      student = await db.studentProfile.findFirst({
        where: { userId: id, schoolId },
      });
    }

    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = parsed.data as any;
    if (data.name || data.email) {
      await db.user.update({
        where: { id: student.userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }
    if (data.profile) {
      const updateData: any = {};

      // Traiter chaque champ individuellement
      if (data.profile.matricule !== undefined)
        updateData.matricule = data.profile.matricule;
      if (data.profile.studentNumber !== undefined)
        updateData.studentNumber = data.profile.studentNumber;
      if (data.profile.gender !== undefined)
        updateData.gender = data.profile.gender;
      if (data.profile.dateOfBirth)
        updateData.dateOfBirth = new Date(data.profile.dateOfBirth);
      if (data.profile.placeOfBirth !== undefined)
        updateData.placeOfBirth = data.profile.placeOfBirth;
      if (data.profile.nationality !== undefined)
        updateData.nationality = data.profile.nationality;
      if (data.profile.bloodType !== undefined)
        updateData.bloodType = data.profile.bloodType;
      if (data.profile.address !== undefined)
        updateData.address = data.profile.address;
      if (data.profile.emergencyContact !== undefined)
        updateData.emergencyContact = data.profile.emergencyContact;
      if (data.profile.emergencyPhone !== undefined)
        updateData.emergencyPhone = data.profile.emergencyPhone;
      if (data.profile.previousSchool !== undefined)
        updateData.previousSchool = data.profile.previousSchool;
      if (data.profile.status !== undefined)
        updateData.status = data.profile.status;

      await db.studentProfile.update({
        where: { id: student.id },
        data: updateData,
      });
    }

    const updated = await db.studentProfile.findFirst({
      where: { id: student.id, schoolId },
      include: includeUser,
    });

    return NextResponse.json({ student: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/active/students/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    // Essayer de trouver l'étudiant par studentProfileId d'abord
    let student = await db.studentProfile.findFirst({
      where: { id, schoolId },
    });

    // Si pas trouvé, essayer par userId
    if (!student) {
      student = await db.studentProfile.findFirst({
        where: { userId: id, schoolId },
      });
    }

    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.userSchool
      .delete({
        where: { userId_schoolId: { userId: student.userId, schoolId } },
      })
      .catch(() => {});
    await db.studentProfile.delete({ where: { id: student.id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
