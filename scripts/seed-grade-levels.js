const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedGradeLevels() {
    console.log("🎓 Updating existing grade levels to COLLEGE...");

    try {
        // Récupérer toutes les classes existantes
        const existingGradeLevels = await prisma.gradeLevel.findMany({
            select: {
                id: true,
                name: true,
                schoolId: true,
                category: true,
            },
        });

        if (existingGradeLevels.length === 0) {
            console.log("❌ No existing grade levels found.");
            return;
        }

        console.log(`📚 Found ${existingGradeLevels.length} existing grade levels`);

        // Mettre toutes les classes existantes au collège
        for (const level of existingGradeLevels) {
            await prisma.gradeLevel.update({
                where: { id: level.id },
                data: { category: "COLLEGE" },
            });

            console.log(`✅ Updated ${level.name} to COLLEGE`);
        }

        console.log("🎉 Grade levels update completed!");
    } catch (error) {
        console.error("❌ Error updating grade levels:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    seedGradeLevels();
}

module.exports = { seedGradeLevels };
