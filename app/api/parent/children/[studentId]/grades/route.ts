import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/parent/children/[studentId]/grades - Récupérer les notes d'un enfant
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";

    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est bien le parent de cet enfant
    const parentProfile = await db.parentProfile.findFirst({
      where: { userId, schoolId },
    });

    if (!parentProfile) {
      return NextResponse.json(
        { error: "Profil parent non trouvé" },
        { status: 404 }
      );
    }

    const isParentOfChild = await db.parentStudent.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        studentProfileId: studentId,
      },
    });

    if (!isParentOfChild) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir ces informations" },
        { status: 403 }
      );
    }

    // Récupérer l'inscription actuelle de l'enfant
    const student = await db.studentProfile.findFirst({
      where: { id: studentId, schoolId },
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
        },
      },
    });

    if (!student || !student.enrollments[0]) {
      return NextResponse.json(
        { error: "Étudiant ou inscription non trouvé" },
        { status: 404 }
      );
    }

    const currentEnrollment = student.enrollments[0];

    // Récupérer les notes de l'étudiant
    const grades = await db.studentGrade.findMany({
      where: {
        studentId: studentId,
        assessment: {
          term: {
            academicYearId: currentEnrollment.academicYearId,
          },
        },
      },
      include: {
        assessment: {
          include: {
            subject: true,
            term: true,
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
          },
        },
      },
      orderBy: [{ score: "desc" }],
    });

    // Organiser les notes par matière et par période
    const gradesBySubjectAndTerm: { [key: string]: { [key: string]: any[] } } =
      {};
    const subjectAverages: {
      [key: string]: { total: number; count: number; grades: any[] };
    } = {};
    const termAverages: {
      [key: string]: {
        termName: string;
        total: number;
        count: number;
        grades: any[];
        subjects: Set<string>;
      };
    } = {};

    grades.forEach(grade => {
      const subjectName = grade.assessment.subject.name;
      const termName = grade.assessment.term?.name || "Sans période";
      const termId = grade.assessment.term?.id || "no-term";

      // Organiser par matière et période
      if (!gradesBySubjectAndTerm[subjectName]) {
        gradesBySubjectAndTerm[subjectName] = {};
      }
      if (!gradesBySubjectAndTerm[subjectName][termName]) {
        gradesBySubjectAndTerm[subjectName][termName] = [];
      }
      gradesBySubjectAndTerm[subjectName][termName].push(grade);

      // Calculer les moyennes par matière
      if (!subjectAverages[subjectName]) {
        subjectAverages[subjectName] = { total: 0, count: 0, grades: [] };
      }
      subjectAverages[subjectName].total += grade.score;
      subjectAverages[subjectName].count += 1;
      subjectAverages[subjectName].grades.push(grade);

      // Calculer les moyennes par période
      if (!termAverages[termId]) {
        termAverages[termId] = {
          termName,
          total: 0,
          count: 0,
          grades: [],
          subjects: new Set(),
        };
      }
      termAverages[termId].total += grade.score;
      termAverages[termId].count += 1;
      termAverages[termId].grades.push(grade);
      termAverages[termId].subjects.add(subjectName);
    });

    // Calculer les moyennes finales
    const finalSubjectAverages = Object.keys(subjectAverages).map(subject => ({
      subject,
      average: subjectAverages[subject].total / subjectAverages[subject].count,
      gradeCount: subjectAverages[subject].count,
      grades: subjectAverages[subject].grades,
    }));

    const finalTermAverages = Object.values(termAverages).map((term: any) => ({
      termId: term.termName === "Sans période" ? "no-term" : undefined,
      termName: term.termName,
      average: term.total / term.count,
      gradeCount: term.count,
      subjectCount: term.subjects.size,
      grades: term.grades,
    }));

    // Moyenne générale
    const overallAverage =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length
        : 0;

    return NextResponse.json({
      student,
      grades,
      gradesBySubjectAndTerm,
      subjectAverages: finalSubjectAverages,
      termAverages: finalTermAverages,
      overallAverage,
      totalGrades: grades.length,
    });
  } catch (error) {
    console.error("Error fetching student grades for parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
