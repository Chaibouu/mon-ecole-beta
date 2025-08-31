// @ts-nocheck
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed minimaliste en cours...");

  const now = new Date();

  // 1. SUPER ADMIN (global)
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@mon-ecole.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@mon-ecole.local",
      password: await bcrypt.hash("superadmin123", 10),
      role: UserRole.SUPER_ADMIN,
      emailVerified: now,
      isActive: true,
    },
  });
  console.log("✅ Super Admin créé");

  // 2. École de démonstration
  const school = await prisma.school.upsert({
    where: { code_isDeleted: { code: "DEMO", isDeleted: false } },
    update: {},
    create: {
      code: "DEMO",
      name: "École de Démonstration",
      address: "123 Rue de l'Éducation",
      phone: "+221 700000001",
      email: "contact@demo.school",
    },
  });
  console.log("✅ École créée");

  // 3. Admin de l'école
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.school" },
    update: {},
    create: {
      name: "Admin Démo",
      email: "admin@demo.school",
      password: await bcrypt.hash("admin123", 10),
      role: UserRole.ADMIN,
      emailVerified: now,
      isActive: true,
    },
  });

  await prisma.userSchool.upsert({
    where: { userId_schoolId: { userId: adminUser.id, schoolId: school.id } },
    update: { role: UserRole.ADMIN },
    create: {
      userId: adminUser.id,
      schoolId: school.id,
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Admin école créé");

  // 4. Année académique active
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: "2024-2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-07-01"),
      isActive: true,
    },
  });
  console.log("✅ Année académique créée");

  // 5. Trimestres
  const [term1, term2, term3] = await Promise.all([
    prisma.term.create({
      data: {
        academicYearId: academicYear.id,
        name: "Trimestre 1",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-15"),
      },
    }),
    prisma.term.create({
      data: {
        academicYearId: academicYear.id,
        name: "Trimestre 2",
        startDate: new Date("2025-01-05"),
        endDate: new Date("2025-03-31"),
      },
    }),
    prisma.term.create({
      data: {
        academicYearId: academicYear.id,
        name: "Trimestre 3",
        startDate: new Date("2025-04-10"),
        endDate: new Date("2025-06-30"),
      },
    }),
  ]);
  console.log("✅ Trimestres créés");

  // 6. Niveaux scolaires
  const gradeLevel = await prisma.gradeLevel.create({
    data: {
      schoolId: school.id,
      name: "6ème",
      description: "Classe de sixième",
    },
  });
  console.log("✅ Niveau scolaire créé");

  // 7. Classe
  const classroom = await prisma.classroom.create({
    data: {
      schoolId: school.id,
      gradeLevelId: gradeLevel.id,
      name: "6ème A",
      description: "Classe de démonstration",
      room: "Salle 101",
    },
  });
  console.log("✅ Classe créée");

  // 8. Matières
  const [math, french] = await Promise.all([
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: "Mathématiques",
        description: "Cours de mathématiques",
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: "Français",
        description: "Cours de français",
      },
    }),
  ]);
  console.log("✅ Matières créées");

  // 9. Coefficients par classe et matière
  await Promise.all([
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: classroom.id,
        subjectId: math.id,
        coefficient: 4,
      },
    }),
    prisma.classroomSubject.create({
      data: {
        schoolId: school.id,
        classroomId: classroom.id,
        subjectId: french.id,
        coefficient: 3,
      },
    }),
  ]);
  console.log("✅ Coefficients matières créés");

  // 10. Professeur
  const teacherUser = await prisma.user.upsert({
    where: { email: "prof@demo.school" },
    update: {},
    create: {
      name: "Prof Démo",
      email: "prof@demo.school",
      password: await bcrypt.hash("prof123", 10),
      role: UserRole.TEACHER,
      emailVerified: now,
      isActive: true,
    },
  });

  await prisma.userSchool.create({
    data: {
      userId: teacherUser.id,
      schoolId: school.id,
      role: UserRole.TEACHER,
    },
  });

  const teacherProfile = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      schoolId: school.id,
      bio: "Professeur de mathématiques",
    },
  });

  // Définir comme professeur principal
  await prisma.classroom.update({
    where: { id: classroom.id },
    data: { headTeacherId: teacherProfile.id },
  });

  console.log("✅ Professeur créé et assigné comme principal");

  // 11. Élève
  const studentUser = await prisma.user.upsert({
    where: { email: "eleve@demo.school" },
    update: {},
    create: {
      name: "Élève Démo",
      email: "eleve@demo.school",
      password: await bcrypt.hash("eleve123", 10),
      role: UserRole.STUDENT,
      emailVerified: now,
      isActive: true,
    },
  });

  await prisma.userSchool.create({
    data: {
      userId: studentUser.id,
      schoolId: school.id,
      role: UserRole.STUDENT,
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      schoolId: school.id,
      matricule: "DEMO-24-001",
      gender: "M",
    },
  });
  console.log("✅ Élève créé");

  // 12. Parent
  const parentUser = await prisma.user.upsert({
    where: { email: "parent@demo.school" },
    update: {},
    create: {
      name: "Parent Démo",
      email: "parent@demo.school",
      password: await bcrypt.hash("parent123", 10),
      role: UserRole.PARENT,
      emailVerified: now,
      isActive: true,
    },
  });

  await prisma.userSchool.create({
    data: {
      userId: parentUser.id,
      schoolId: school.id,
      role: UserRole.PARENT,
    },
  });

  const parentProfile = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      schoolId: school.id,
      phone: "+221 770000001",
      address: "Adresse du parent",
    },
  });

  // Lien parent-enfant
  await prisma.parentStudent.create({
    data: {
      parentProfileId: parentProfile.id,
      studentProfileId: studentProfile.id,
      relationship: "père",
    },
  });
  console.log("✅ Parent créé et lié à l'élève");

  // 13. Inscription de l'élève
  await prisma.enrollment.create({
    data: {
      studentId: studentProfile.id,
      classroomId: classroom.id,
      academicYearId: academicYear.id,
      status: "ACTIVE",
    },
  });
  console.log("✅ Inscription créée");

  // 14. Affectation du professeur
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherProfile.id,
      subjectId: math.id,
      classroomId: classroom.id,
      academicYearId: academicYear.id,
    },
  });
  console.log("✅ Affectation professeur créée");

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n📋 Comptes créés :");
  console.log("👑 Super Admin: superadmin@mon-ecole.local / superadmin123");
  console.log("🏫 Admin École: admin@demo.school / admin123");
  console.log("👨‍🏫 Professeur: prof@demo.school / prof123");
  console.log("👨‍🎓 Élève: eleve@demo.school / eleve123");
  console.log("👨‍👩‍👧‍👦 Parent: parent@demo.school / parent123");
}

main()
  .catch(error => {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
