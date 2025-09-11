import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/students/[id] - Récupérer tous les détails d'un élève
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id; // L'ID passé est maintenant le userId

    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";
    const authenticatedUserId = await getUserIdFromToken(token);

    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const roleOk = await requireSchoolRole(authenticatedUserId, schoolId, [
      "SUPER_ADMIN",
      "ADMIN",
      "TEACHER",
      "PARENT",
      "STUDENT",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // D'abord, récupérer l'ID du studentProfile à partir du userId
    const studentProfile = await db.studentProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Profil étudiant non trouvé" },
        { status: 404 }
      );
    }

    const studentId = studentProfile.id;

    // Vérifier si l'utilisateur authentifié a accès à cet étudiant
    const userRole = await db.userSchool.findFirst({
      where: { userId: authenticatedUserId, schoolId },
      select: { role: true },
    });

    if (userRole?.role === "PARENT") {
      // Vérifier que ce parent a bien ce student comme enfant
      const parentProfile = await db.parentProfile.findFirst({
        where: { userId: authenticatedUserId, schoolId },
      });

      if (!parentProfile) {
        return NextResponse.json(
          { error: "Profil parent non trouvé" },
          { status: 404 }
        );
      }

      const parentStudent = await db.parentStudent.findFirst({
        where: {
          parentProfileId: parentProfile.id,
          studentProfileId: studentId,
        },
      });

      if (!parentStudent) {
        return NextResponse.json(
          { error: "Accès non autorisé à cet étudiant" },
          { status: 403 }
        );
      }
    }

    // Vérifier si l'utilisateur est un enseignant et s'il a accès à cet étudiant
    if (userRole?.role === "TEACHER") {
      const teacherProfile = await db.teacherProfile.findFirst({
        where: { userId: authenticatedUserId, schoolId },
      });

      if (!teacherProfile) {
        return NextResponse.json(
          { error: "Profil enseignant non trouvé" },
          { status: 404 }
        );
      }

      // Vérifier que l'enseignant a des cours avec cet élève
      const hasAccess = await db.timetableEntry.findFirst({
        where: {
          teacherId: teacherProfile.id,
          classroom: {
            enrollments: {
              some: {
                studentId: studentId,
                academicYearId: academicYearId || {
                  not: undefined,
                },
              },
            },
          },
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Accès non autorisé à cet étudiant" },
          { status: 403 }
        );
      }
    }

    // Vérifier si l'utilisateur est l'étudiant lui-même
    if (userRole?.role === "STUDENT") {
      if (authenticatedUserId !== userId) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    // Récupérer l'élève avec toutes ses informations
    const student = await db.studentProfile.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
      include: {
        user: true,
        enrollments: {
          where: academicYearId
            ? { academicYearId }
            : {
                academicYear: { isActive: true },
              },
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

    if (!student) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'inscription actuelle
    const currentEnrollment = student.enrollments.find(
      e => e.status === "ACTIVE"
    );

    // Récupérer les enregistrements d'assiduité séparément
    const attendanceRecords = await db.attendanceRecord.findMany({
      where: {
        studentId: studentId,
        ...(academicYearId
          ? {
              timetableEntry: {
                academicYearId,
              },
            }
          : {
              timetableEntry: {
                academicYear: { isActive: true },
              },
            }),
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

    // Récupérer l'emploi du temps de l'élève
    let timetable = null;
    if (currentEnrollment) {
      const timetableEntries = await db.timetableEntry.findMany({
        where: {
          classroomId: currentEnrollment.classroomId,
          academicYearId: academicYearId || {
            not: undefined,
          },
        },
        include: {
          subject: true,
          teacher: {
            include: {
              user: true,
            },
          },
          classroom: {
            include: {
              gradeLevel: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });

      // Organiser par jour de la semaine
      const timetableByDay: { [key: string]: any[] } = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
      };

      timetableEntries.forEach(entry => {
        const dayName = entry.dayOfWeek;
        if (timetableByDay[dayName]) {
          timetableByDay[dayName].push({
            id: entry.id,
            subject: entry.subject,
            teacher: entry.teacher,
            startTime: entry.startTime,
            endTime: entry.endTime,
          });
        }
      });

      timetable = {
        classroom: currentEnrollment.classroom,
        timetable: timetableByDay,
        timetableEntries,
      };
    }

    // Calculer les statistiques de paiement
    const totalPaid = student.payments.reduce(
      (sum: number, payment: any) => sum + payment.amountCents,
      0
    );

    // Récupérer les frais applicables pour calculer le total dû
    let totalDue = 0;
    let feeSchedules = [];
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
        include: {
          gradeLevel: true,
          classroom: true,
          term: true,
          installments: {
            orderBy: {
              installmentOrder: "asc",
            },
          },
        },
      });

      // Calculer le total dû basé sur les frais principaux uniquement
      const mainFees = applicableFees.filter(
        f => f.parentFeeId === null && !f.itemName.includes(" - ")
      );
      totalDue = mainFees.reduce(
        (sum: number, fee: any) => sum + fee.amountCents,
        0
      );
      feeSchedules = applicableFees;
    }

    const balance = totalDue - totalPaid;

    // Calculer les statistiques d'assiduité
    const attendanceStats = {
      totalRecords: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === "PRESENT")
        .length,
      absentCount: attendanceRecords.filter(r => r.status === "ABSENT").length,
      lateCount: attendanceRecords.filter(r => r.status === "LATE").length,
      excusedCount: 0, // EXCUSED status not available in current model
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

    // Récupérer les parents de l'élève
    const parentStudents = await db.parentStudent.findMany({
      where: {
        studentProfileId: studentId,
      },
    });

    return NextResponse.json({
      student: {
        id: student.id,
        user: student.user,
        matricule: student.matricule,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
      },
      currentEnrollment: currentEnrollment || null,
      allEnrollments: student.enrollments,
      timetable,
      parents: parentStudents.map(ps => ({
        id: ps.id,
        relationship: ps.relationship,
      })),
      paymentSummary: {
        totalDue,
        totalPaid,
        balance,
        feeScheduleCount: feeSchedules.length,
        recentPayments: student.payments.slice(0, 5),
      },
      attendanceSummary: {
        ...attendanceStats,
        recentRecords: attendanceRecords.slice(0, 10),
        recordsBySubject: attendanceRecords.reduce((acc: any, record: any) => {
          const subjectName = record.timetableEntry.subject.name;
          if (!acc[subjectName]) {
            acc[subjectName] = {
              total: 0,
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
            };
          }
          acc[subjectName].total++;
          acc[subjectName][record.status.toLowerCase()]++;
          return acc;
        }, {}),
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
        parentsCount: parentStudents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
