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
  const [gradeLevel, gradeLevel4eme] = await Promise.all([
    prisma.gradeLevel.create({
      data: {
        schoolId: school.id,
        name: "6ème",
        description: "Classe de sixième",
      },
    }),
    prisma.gradeLevel.create({
      data: {
        schoolId: school.id,
        name: "4ème",
        description: "Classe de quatrième",
      },
    }),
  ]);
  console.log("✅ Niveaux scolaires créés");

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

  // 8. Catégories de matières
  const [catSci, catLit, catLang, catSport] = await Promise.all([
    prisma.subjectCategory.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Scientifique" } },
      update: {},
      create: {
        schoolId: school.id,
        name: "Scientifique",
        description: "Sciences",
      },
    }),
    prisma.subjectCategory.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Littéraire" } },
      update: {},
      create: {
        schoolId: school.id,
        name: "Littéraire",
        description: "Lettres et sciences humaines",
      },
    }),
    prisma.subjectCategory.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Langues" } },
      update: {},
      create: {
        schoolId: school.id,
        name: "Langues",
        description: "Langues étrangères",
      },
    }),
    prisma.subjectCategory.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Sport" } },
      update: {},
      create: {
        schoolId: school.id,
        name: "Sport",
        description: "Éducation physique et sportive",
      },
    }),
  ]);

  // 9. Matières
  const [math, french, english, sport] = await Promise.all([
    prisma.subject.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Mathématiques" } },
      update: { categoryId: catSci.id },
      create: {
        schoolId: school.id,
        name: "Mathématiques",
        description: "Cours de mathématiques",
        categoryId: catSci.id,
      },
    }),
    prisma.subject.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Français" } },
      update: { categoryId: catLit.id },
      create: {
        schoolId: school.id,
        name: "Français",
        description: "Cours de français",
        categoryId: catLit.id,
      },
    }),
    prisma.subject.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "Anglais" } },
      update: { categoryId: catLang.id },
      create: {
        schoolId: school.id,
        name: "Anglais",
        description: "Cours d'anglais",
        categoryId: catLang.id,
      },
    }),
    prisma.subject.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "EPS" } },
      update: { categoryId: catSport.id },
      create: {
        schoolId: school.id,
        name: "EPS",
        description: "Éducation physique et sportive",
        categoryId: catSport.id,
      },
    }),
  ]);
  console.log("✅ Catégories et matières créées");

  // 10. Coefficients par niveau (source principale)
  await Promise.all([
    prisma.gradeLevelSubject.upsert({
      where: {
        gradeLevelId_subjectId: {
          gradeLevelId: gradeLevel.id,
          subjectId: math.id,
        },
      },
      update: { coefficient: 4 },
      create: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        subjectId: math.id,
        coefficient: 4,
      },
    }),
    prisma.gradeLevelSubject.upsert({
      where: {
        gradeLevelId_subjectId: {
          gradeLevelId: gradeLevel.id,
          subjectId: french.id,
        },
      },
      update: { coefficient: 3 },
      create: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        subjectId: french.id,
        coefficient: 3,
      },
    }),
    prisma.gradeLevelSubject.upsert({
      where: {
        gradeLevelId_subjectId: {
          gradeLevelId: gradeLevel.id,
          subjectId: english.id,
        },
      },
      update: { coefficient: 2 },
      create: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        subjectId: english.id,
        coefficient: 2,
      },
    }),
    prisma.gradeLevelSubject.upsert({
      where: {
        gradeLevelId_subjectId: {
          gradeLevelId: gradeLevel.id,
          subjectId: sport.id,
        },
      },
      update: { coefficient: 1 },
      create: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        subjectId: sport.id,
        coefficient: 1,
      },
    }),
  ]);
  console.log("✅ Coefficients par niveau créés");

  // 11. Professeur
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

  await prisma.userSchool.upsert({
    where: { userId_schoolId: { userId: teacherUser.id, schoolId: school.id } },
    update: { role: UserRole.TEACHER },
    create: {
      userId: teacherUser.id,
      schoolId: school.id,
      role: UserRole.TEACHER,
    },
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId_schoolId: { userId: teacherUser.id, schoolId: school.id } },
    update: { bio: "Professeur de mathématiques" },
    create: {
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

  // 12. Élève
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

  // 13. Parent
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

  // 14. Inscription de l'élève
  await prisma.enrollment.create({
    data: {
      studentId: studentProfile.id,
      classroomId: classroom.id,
      academicYearId: academicYear.id,
      status: "ACTIVE",
    },
  });
  console.log("✅ Inscription créée");

  // 15. Affectation du professeur
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherProfile.id,
      subjectId: math.id,
      classroomId: classroom.id,
      academicYearId: academicYear.id,
    },
  });
  console.log("✅ Affectation professeur créée");

  // 16. Frais scolaires avec tranches
  const mainFee = await prisma.feeSchedule.create({
    data: {
      schoolId: school.id,
      gradeLevelId: gradeLevel.id,
      itemName: "Frais de scolarité T1",
      amountCents: 20000000, // 200,000 FCFA
      dueDate: new Date("2024-12-31"),
      isInstallment: false,
    },
  });

  // Tranches du frais principal
  const [tranche1, tranche2, tranche3] = await Promise.all([
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        itemName: "1ère tranche",
        amountCents: 7000000, // 70,000 FCFA
        dueDate: new Date("2024-10-15"),
        isInstallment: true,
        parentFeeId: mainFee.id,
        installmentOrder: 1,
      },
    }),
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        itemName: "2ème tranche",
        amountCents: 7000000, // 70,000 FCFA
        dueDate: new Date("2024-11-15"),
        isInstallment: true,
        parentFeeId: mainFee.id,
        installmentOrder: 2,
      },
    }),
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel.id,
        itemName: "3ème tranche",
        amountCents: 6000000, // 60,000 FCFA
        dueDate: new Date("2024-12-15"),
        isInstallment: true,
        parentFeeId: mainFee.id,
        installmentOrder: 3,
      },
    }),
  ]);

  // Frais supplémentaires
  const uniformFee = await prisma.feeSchedule.create({
    data: {
      schoolId: school.id,
      gradeLevelId: gradeLevel.id,
      itemName: "Frais d'uniforme",
      amountCents: 5000000, // 50,000 FCFA
      dueDate: new Date("2024-09-30"),
      isInstallment: false,
    },
  });

  const transportFee = await prisma.feeSchedule.create({
    data: {
      schoolId: school.id,
      gradeLevelId: gradeLevel.id,
      itemName: "Frais de transport",
      amountCents: 3000000, // 30,000 FCFA
      dueDate: new Date("2024-10-01"),
      isInstallment: false,
    },
  });

  console.log("✅ Frais scolaires créés avec tranches");

  // Frais pour le niveau 4ème (plus chers)
  const mainFee4eme = await prisma.feeSchedule.create({
    data: {
      schoolId: school.id,
      gradeLevelId: gradeLevel4eme.id,
      itemName: "Frais de scolarité T1",
      amountCents: 35000000, // 350,000 FCFA
      dueDate: new Date("2024-12-31"),
      isInstallment: false,
    },
  });

  // Tranches pour le niveau 4ème
  await Promise.all([
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel4eme.id,
        itemName: "1ère tranche",
        amountCents: 12000000, // 120,000 FCFA
        dueDate: new Date("2024-10-15"),
        isInstallment: true,
        parentFeeId: mainFee4eme.id,
        installmentOrder: 1,
      },
    }),
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel4eme.id,
        itemName: "2ème tranche",
        amountCents: 12000000, // 120,000 FCFA
        dueDate: new Date("2024-11-15"),
        isInstallment: true,
        parentFeeId: mainFee4eme.id,
        installmentOrder: 2,
      },
    }),
    prisma.feeSchedule.create({
      data: {
        schoolId: school.id,
        gradeLevelId: gradeLevel4eme.id,
        itemName: "3ème tranche",
        amountCents: 11000000, // 110,000 FCFA
        dueDate: new Date("2024-12-15"),
        isInstallment: true,
        parentFeeId: mainFee4eme.id,
        installmentOrder: 3,
      },
    }),
  ]);

  console.log("✅ Frais scolaires 4ème créés");

  // 17. Paiements de démonstration
  const [payment1, payment2, payment3] = await Promise.all([
    // Paiement de la 1ère tranche
    prisma.payment.create({
      data: {
        schoolId: school.id,
        studentId: studentProfile.id,
        feeScheduleId: tranche1.id,
        amountCents: 7000000, // Paiement complet de la tranche
        method: "CASH",
        paidAt: new Date("2024-10-10"),
        dueDate: new Date("2024-10-15"),
        notes: "Paiement 1ère tranche - Espèces",
      },
    }),
    // Paiement partiel de la 2ème tranche
    prisma.payment.create({
      data: {
        schoolId: school.id,
        studentId: studentProfile.id,
        feeScheduleId: tranche2.id,
        amountCents: 3500000, // Paiement partiel (50%)
        method: "BANK_TRANSFER",
        paidAt: new Date("2024-11-05"),
        dueDate: new Date("2024-11-15"),
        notes: "Paiement partiel 2ème tranche - Virement",
      },
    }),
    // Paiement des frais d'uniforme
    prisma.payment.create({
      data: {
        schoolId: school.id,
        studentId: studentProfile.id,
        feeScheduleId: uniformFee.id,
        amountCents: 5000000, // Paiement complet
        method: "MOBILE_MONEY",
        paidAt: new Date("2024-09-25"),
        dueDate: new Date("2024-09-30"),
        notes: "Paiement uniforme - Mobile Money",
      },
    }),
  ]);

  console.log("✅ Paiements de démonstration créés");

  // 18. Créer un deuxième élève pour des données plus réalistes
  const student2User = await prisma.user.create({
    data: {
      name: "Marie Diop",
      email: "marie@demo.school",
      password: await bcrypt.hash("marie123", 10),
      role: UserRole.STUDENT,
      emailVerified: now,
      isActive: true,
    },
  });

  await prisma.userSchool.create({
    data: {
      userId: student2User.id,
      schoolId: school.id,
      role: UserRole.STUDENT,
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      schoolId: school.id,
      matricule: "DEMO-24-002",
      gender: "F",
    },
  });

  // Inscription du 2ème élève
  await prisma.enrollment.create({
    data: {
      studentId: student2Profile.id,
      classroomId: classroom.id,
      academicYearId: academicYear.id,
      status: "ACTIVE",
    },
  });

  // Paiement complet des frais de scolarité pour le 2ème élève (mode paiement unique)
  await prisma.payment.create({
    data: {
      schoolId: school.id,
      studentId: student2Profile.id,
      feeScheduleId: mainFee.id, // Paiement sur le frais principal
      amountCents: 20000000, // Paiement complet
      method: "BANK_TRANSFER",
      paidAt: new Date("2024-09-15"),
      dueDate: new Date("2024-12-31"),
      notes: "Paiement complet frais T1 - Virement bancaire",
    },
  });

  console.log("✅ Deuxième élève créé avec paiement complet");

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n📋 Comptes créés :");
  console.log("👑 Super Admin: superadmin@mon-ecole.local / superadmin123");
  console.log("🏫 Admin École: admin@demo.school / admin123");
  console.log("👨‍🏫 Professeur: prof@demo.school / prof123");
  console.log("👨‍🎓 Élève: eleve@demo.school / eleve123");
  console.log("👩‍🎓 Élève 2: marie@demo.school / marie123");
  console.log("👨‍👩‍👧‍👦 Parent: parent@demo.school / parent123");
  console.log("\n💰 Données de paiements créées :");
  console.log("📊 Frais scolaires avec tranches de paiement");
  console.log("💳 Paiements de démonstration (partiels et complets)");
  console.log("📈 Analytics prêtes pour les tests");
}

main()
  .catch(error => {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
