import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting minimal database seeding...");

  try {
    // Create Super Admin User
    console.log("👤 Creating Super Admin...");
    const superAdminUser = await prisma.user.upsert({
      where: { email: "admin@sahelcoders.com" },
      update: {},
      create: {
        name: "Super Admin",
        email: "admin@sahelcoders.com",
        password: await bcrypt.hash("admin123", 12),
        emailVerified: new Date(),
        role: "SUPER_ADMIN",
      },
    });

    console.log("🏫 Creating School...");
    const school = await prisma.school.upsert({
      where: {
        code_isDeleted: {
          code: "SAHEL_CODERS",
          isDeleted: false,
        },
      },
      update: {},
      create: {
        name: "École Sahel Coders",
        code: "SAHEL_CODERS",
        address: "Niamey , Niger",
        phone: "+227 12345678",
        email: "contact@sahelcoders.com",
        isActive: true,
      },
    });

    // Link Super Admin to School
    console.log("🔗 Linking Super Admin to School...");
    await prisma.userSchool.upsert({
      where: {
        userId_schoolId: {
          userId: superAdminUser.id,
          schoolId: school.id,
        },
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        schoolId: school.id,
        role: "SUPER_ADMIN",
      },
    });

    console.log("✅ Minimal seed completed successfully!");
    console.log("📧 Super Admin Email: admin@sahel-coders.com");
    console.log("🔑 Super Admin Password: admin123");
    console.log("🏫 School: École Sahel Coders");

    // Phase 1 Backfill: Assessment Types & link existing assessments
    console.log("🧱 Backfilling assessment types...");
    const schools = await prisma.school.findMany({ select: { id: true } });
    for (const s of schools) {
      const existing = await prisma.assessmentTypeModel.findMany({
        where: { schoolId: s.id },
      });
      if (existing.length === 0) {
        await prisma.assessmentTypeModel.createMany({
          data: [
            {
              schoolId: s.id,
              name: "Examen",
              code: "EXAM",
              defaultMaxScore: 20,
              defaultCoefficient: 1,
              order: 1,
            },
            {
              schoolId: s.id,
              name: "Quiz",
              code: "QUIZ",
              defaultMaxScore: 10,
              defaultCoefficient: 1,
              order: 2,
            },
            {
              schoolId: s.id,
              name: "Devoir",
              code: "HOMEWORK",
              defaultMaxScore: 20,
              defaultCoefficient: 1,
              order: 3,
            },
          ],
          skipDuplicates: true,
        });
      }
      const types = await prisma.assessmentTypeModel.findMany({
        where: { schoolId: s.id },
      });
      const mapByCode = new Map(types.map(t => [t.code || t.name, t.id]));
      const assessments = await prisma.assessment.findMany({
        where: { schoolId: s.id, assessmentTypeId: null },
      });
      for (const a of assessments) {
        const mappedId = mapByCode.get(a.type as any);
        await prisma.assessment.update({
          where: { id: a.id },
          data: {
            assessmentTypeId: mappedId,
            maxScore: a.maxScore || (a.type === "QUIZ" ? 10 : 20),
          },
        });
      }
    }
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
