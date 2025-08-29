// @ts-nocheck
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedUsers() {
  const now = new Date();

  // SUPER ADMIN (global)
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@mon-ecole.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@mon-ecole.local",
      password: await bcrypt.hash("superadmin", 10),
      role: UserRole.SUPER_ADMIN,
      emailVerified: now,
      isActive: true,
    },
  });

  return { superAdmin };
}

async function seedSchoolAlpha() {
  const school = await prisma.school.upsert({
    where: { code_isDeleted: { code: "ALPHA", isDeleted: false } },
    update: {},
    create: {
      code: "ALPHA",
      name: "École Alpha",
      address: "Quartier Central, Ville A",
      phone: "+221 700000001",
      email: "contact@alpha.school",
    },
  });

  // Admin de l'école
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin.alpha@mon-ecole.local" },
    update: {},
    create: {
      name: "Admin Alpha",
      email: "admin.alpha@mon-ecole.local",
      password: await bcrypt.hash("adminalpha", 10),
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  await prisma.userSchool.upsert({
    where: { userId_schoolId: { userId: schoolAdmin.id, schoolId: school.id } },
    update: { role: UserRole.ADMIN },
    create: {
      userId: schoolAdmin.id,
      schoolId: school.id,
      role: UserRole.ADMIN,
    },
  });

  // Année scolaire et trimestres
  const year = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: "2024-2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-07-01"),
      isActive: true,
    },
  });
  const [t1, t2, t3] = await Promise.all([
    prisma.term.create({
      data: {
        academicYearId: year.id,
        name: "Trimestre 1",
        order: 1,
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-15"),
      },
    }),
    prisma.term.create({
      data: {
        academicYearId: year.id,
        name: "Trimestre 2",
        order: 2,
        startDate: new Date("2025-01-05"),
        endDate: new Date("2025-03-31"),
      },
    }),
    prisma.term.create({
      data: {
        academicYearId: year.id,
        name: "Trimestre 3",
        order: 3,
        startDate: new Date("2025-04-10"),
        endDate: new Date("2025-06-30"),
      },
    }),
  ]);

  // Niveaux / Classes
  const [sixieme, cinquieme] = await Promise.all([
    prisma.gradeLevel.create({
      data: { schoolId: school.id, name: "6ème", code: "6EME" },
    }),
    prisma.gradeLevel.create({
      data: { schoolId: school.id, name: "5ème", code: "5EME" },
    }),
  ]);

  const [c6A, c6B, c5A] = await Promise.all([
    prisma.classroom.create({
      data: {
        schoolId: school.id,
        gradeLevelId: sixieme.id,
        name: "6ème A",
        capacity: 40,
      },
    }),
    prisma.classroom.create({
      data: {
        schoolId: school.id,
        gradeLevelId: sixieme.id,
        name: "6ème B",
        capacity: 40,
      },
    }),
    prisma.classroom.create({
      data: {
        schoolId: school.id,
        gradeLevelId: cinquieme.id,
        name: "5ème A",
        capacity: 40,
      },
    }),
  ]);

  // Matières
  const [math, french, english, physics] = await Promise.all([
    prisma.subject.create({
      data: { schoolId: school.id, name: "Mathématiques", code: "MATH" },
    }),
    prisma.subject.create({
      data: { schoolId: school.id, name: "Français", code: "FR" },
    }),
    prisma.subject.create({
      data: { schoolId: school.id, name: "Anglais", code: "EN" },
    }),
    prisma.subject.create({
      data: { schoolId: school.id, name: "Physique", code: "PHY" },
    }),
  ]);

  // Coefficients par classe et matière
  await Promise.all([
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c6A.id,
        subjectId: math.id,
        coefficient: 4,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c6A.id,
        subjectId: french.id,
        coefficient: 3,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c6A.id,
        subjectId: english.id,
        coefficient: 2,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c6A.id,
        subjectId: physics.id,
        coefficient: 2,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c6B.id,
        subjectId: math.id,
        coefficient: 4,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: c5A.id,
        subjectId: math.id,
        coefficient: 5,
      },
    }),
  ]);

  // Enseignants
  const [uTeach1, uTeach2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "teacher.math.alpha@mon-ecole.local" },
      update: {},
      create: {
        name: "Prof Math Alpha",
        email: "teacher.math.alpha@mon-ecole.local",
        password: await bcrypt.hash("teachermath", 10),
        role: UserRole.TEACHER,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "teacher.fr.alpha@mon-ecole.local" },
      update: {},
      create: {
        name: "Prof Français Alpha",
        email: "teacher.fr.alpha@mon-ecole.local",
        password: await bcrypt.hash("teacherfr", 10),
        role: UserRole.TEACHER,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uTeach1.id, schoolId: school.id } },
      update: { role: UserRole.TEACHER },
      create: {
        userId: uTeach1.id,
        schoolId: school.id,
        role: UserRole.TEACHER,
      },
    }),
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uTeach2.id, schoolId: school.id } },
      update: { role: UserRole.TEACHER },
      create: {
        userId: uTeach2.id,
        schoolId: school.id,
        role: UserRole.TEACHER,
      },
    }),
  ]);

  const [tTeach1, tTeach2] = await Promise.all([
    prisma.teacherProfile.create({
      data: {
        userId: uTeach1.id,
        schoolId: school.id,
        bio: "Enseignant de mathématiques",
      },
    }),
    prisma.teacherProfile.create({
      data: {
        userId: uTeach2.id,
        schoolId: school.id,
        bio: "Enseignant de français",
      },
    }),
  ]);

  // Parents
  const [uParent1, uParent2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "parent.dupont@mon-ecole.local" },
      update: {},
      create: {
        name: "Parent Dupont",
        email: "parent.dupont@mon-ecole.local",
        password: await bcrypt.hash("parentdupont", 10),
        role: UserRole.PARENT,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "parent.ndiaye@mon-ecole.local" },
      update: {},
      create: {
        name: "Parent Ndiaye",
        email: "parent.ndiaye@mon-ecole.local",
        password: await bcrypt.hash("parentndiaye", 10),
        role: UserRole.PARENT,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uParent1.id, schoolId: school.id } },
      update: { role: UserRole.PARENT },
      create: {
        userId: uParent1.id,
        schoolId: school.id,
        role: UserRole.PARENT,
      },
    }),
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uParent2.id, schoolId: school.id } },
      update: { role: UserRole.PARENT },
      create: {
        userId: uParent2.id,
        schoolId: school.id,
        role: UserRole.PARENT,
      },
    }),
  ]);

  const [p1, p2] = await Promise.all([
    prisma.parentProfile.create({
      data: {
        userId: uParent1.id,
        schoolId: school.id,
        phone: "+221 770000100",
        address: "Quartier A",
      },
    }),
    prisma.parentProfile.create({
      data: {
        userId: uParent2.id,
        schoolId: school.id,
        phone: "+221 770000200",
        address: "Quartier B",
      },
    }),
  ]);

  // Élèves
  const [uStud1, uStud2, uStud3] = await Promise.all([
    prisma.user.upsert({
      where: { email: "eleve.amine@mon-ecole.local" },
      update: {},
      create: {
        name: "Amine",
        email: "eleve.amine@mon-ecole.local",
        password: await bcrypt.hash("eleveamine", 10),
        role: UserRole.STUDENT,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "eleve.aicha@mon-ecole.local" },
      update: {},
      create: {
        name: "Aïcha",
        email: "eleve.aicha@mon-ecole.local",
        password: await bcrypt.hash("eleveaicha", 10),
        role: UserRole.STUDENT,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "eleve.pierre@mon-ecole.local" },
      update: {},
      create: {
        name: "Pierre",
        email: "eleve.pierre@mon-ecole.local",
        password: await bcrypt.hash("elevepierre", 10),
        role: UserRole.STUDENT,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uStud1.id, schoolId: school.id } },
      update: { role: UserRole.STUDENT },
      create: {
        userId: uStud1.id,
        schoolId: school.id,
        role: UserRole.STUDENT,
      },
    }),
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uStud2.id, schoolId: school.id } },
      update: { role: UserRole.STUDENT },
      create: {
        userId: uStud2.id,
        schoolId: school.id,
        role: UserRole.STUDENT,
      },
    }),
    prisma.userSchool.upsert({
      where: { userId_schoolId: { userId: uStud3.id, schoolId: school.id } },
      update: { role: UserRole.STUDENT },
      create: {
        userId: uStud3.id,
        schoolId: school.id,
        role: UserRole.STUDENT,
      },
    }),
  ]);

  const [s1, s2, s3] = await Promise.all([
    prisma.studentProfile.create({
      data: {
        userId: uStud1.id,
        schoolId: school.id,
        matricule: "ALPHA-24-0001",
        gender: "M",
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: uStud2.id,
        schoolId: school.id,
        matricule: "ALPHA-24-0002",
        gender: "F",
      },
    }),
    prisma.studentProfile.create({
      data: {
        userId: uStud3.id,
        schoolId: school.id,
        matricule: "ALPHA-24-0003",
        gender: "M",
      },
    }),
  ]);

  await Promise.all([
    prisma.parentStudent.create({
      data: {
        parentProfileId: p1.id,
        studentProfileId: s1.id,
        relationship: "père",
      },
    }),
    prisma.parentStudent.create({
      data: {
        parentProfileId: p2.id,
        studentProfileId: s2.id,
        relationship: "mère",
      },
    }),
  ]);

  // Inscriptions (enrollments)
  await Promise.all([
    prisma.enrollment.create({
      data: {
        studentId: s1.id,
        classroomId: c6A.id,
        academicYearId: year.id,
        status: "ACTIVE",
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: s2.id,
        classroomId: c6A.id,
        academicYearId: year.id,
        status: "ACTIVE",
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: s3.id,
        classroomId: c6B.id,
        academicYearId: year.id,
        status: "ACTIVE",
      },
    }),
  ]);

  // Affectations enseignants
  await Promise.all([
    prisma.teacherAssignment.create({
      data: {
        teacherId: tTeach1.id,
        subjectId: math.id,
        classroomId: c6A.id,
        academicYearId: year.id,
      },
    }),
    prisma.teacherAssignment.create({
      data: {
        teacherId: tTeach2.id,
        subjectId: french.id,
        classroomId: c6A.id,
        academicYearId: year.id,
      },
    }),
  ]);

  // Emploi du temps (exemple)
  await Promise.all([
    prisma.timetableEntry.create({
      data: {
        classroomId: c6A.id,
        subjectId: math.id,
        teacherId: tTeach1.id,
        dayOfWeek: "MONDAY" as any,
        startTime: new Date("2024-09-02T08:00:00Z"),
        endTime: new Date("2024-09-02T10:00:00Z"),
      },
    }),
    prisma.timetableEntry.create({
      data: {
        classroomId: c6A.id,
        subjectId: french.id,
        teacherId: tTeach2.id,
        dayOfWeek: "MONDAY" as any,
        startTime: new Date("2024-09-02T10:15:00Z"),
        endTime: new Date("2024-09-02T12:00:00Z"),
      },
    }),
  ]);

  // Frais scolaires
  const [feeInscription, feeMensualite] = await Promise.all([
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: sixieme.id,
        itemName: "Frais d'inscription",
        amountCents: 5000000,
      },
    }),
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        classroomId: c6A.id,
        termId: t1.id,
        itemName: "Mensualité T1",
        amountCents: 2000000,
        dueDate: new Date("2024-10-05"),
      },
    }),
  ]);

  // Factures + Paiements
  const inv1 = await prisma.invoice.create({
    data: {
      schoolId: school.id,
      studentId: s1.id,
      feeScheduleId: feeInscription.id,
      amountCents: feeInscription.amountCents,
      status: "PAID" as any,
    },
  });
  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      amountCents: feeInscription.amountCents,
      method: "cash",
      reference: "RCPT-ALPHA-0001",
    },
  });
  await prisma.invoice.create({
    data: {
      schoolId: school.id,
      studentId: s1.id,
      feeScheduleId: feeMensualite.id,
      amountCents: feeMensualite.amountCents,
      status: "PENDING" as any,
      dueDate: feeMensualite.dueDate ?? undefined,
    },
  });

  // Devoirs et notes
  const dev1 = await prisma.assessment.create({
    data: {
      schoolId: school.id,
      subjectId: math.id,
      classroomId: c6A.id,
      termId: t1.id,
      createdById: tTeach1.id,
      title: "DM #1",
      description: "Fractions",
      type: "HOMEWORK" as any,
      coefficient: 2,
      assignedAt: new Date("2024-09-10"),
    },
  });
  await Promise.all([
    prisma.studentGrade.create({
      data: { assessmentId: dev1.id, studentId: s1.id, score: 15 },
    }),
    prisma.studentGrade.create({
      data: { assessmentId: dev1.id, studentId: s2.id, score: 12 },
    }),
  ]);

  // Présences
  await prisma.attendanceRecord.create({
    data: {
      studentId: s1.id,
      date: new Date("2024-09-02"),
      status: "PRESENT" as any,
      notes: "À l'heure",
    },
  });

  return { school };
}

async function seedSchoolBeta() {
  const school = await prisma.school.upsert({
    where: { code_isDeleted: { code: "BETA", isDeleted: false } },
    update: {},
    create: {
      code: "BETA",
      name: "École Beta",
      address: "Avenue du Savoir, Ville B",
      phone: "+221 700000002",
      email: "contact@beta.school",
    },
  });

  // Admin de l'école
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin.beta@mon-ecole.local" },
    update: {},
    create: {
      name: "Admin Beta",
      email: "admin.beta@mon-ecole.local",
      password: await bcrypt.hash("adminbeta", 10),
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  await prisma.userSchool.upsert({
    where: { userId_schoolId: { userId: schoolAdmin.id, schoolId: school.id } },
    update: { role: UserRole.ADMIN },
    create: {
      userId: schoolAdmin.id,
      schoolId: school.id,
      role: UserRole.ADMIN,
    },
  });

  // Année scolaire active
  await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: "2024-2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-07-01"),
      isActive: true,
    },
  });

  return { school };
}

async function main() {
  console.log("Seeding dataset (multi-établissement)...");
  await seedUsers();
  await seedSchoolAlpha();
  await seedSchoolBeta();
  console.log("Seed terminé.");
}

main()
  .catch(error => {
    console.error("Error seeding data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
