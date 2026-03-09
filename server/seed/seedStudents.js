require("dotenv").config();
const prisma = require("../config/dbConnect");

function randomAge() {
  return Math.floor(Math.random() * 10) + 15; // 15–24
}

function randomStatus() {
  return Math.random() > 0.1 ? "ACTIVE" : "DELETED"; // 10% deleted
}

async function seedStudents() {
  try {
    // 🔹 Check if DB already has students
    const existingStudents = await prisma.student.count();

    if (existingStudents > 0) {
      console.log(`⏭ Seed skipped. ${existingStudents} students already exist.`);
      return;
    }

    console.log("🌱 Database empty. Starting seed...");

    const total = 5000;
    const batchSize = 1000;

    for (let i = 0; i < total; i += batchSize) {
      const students = [];

      for (let j = 0; j < batchSize; j++) {
        const index = i + j;
        if (index >= total) break;

        students.push({
          name: `Student ${index + 1}`,
          email: `student${index + 1}@school.com`,
          age: randomAge(),
          status: randomStatus()
        });
      }

      await prisma.student.createMany({
        data: students,
        skipDuplicates: true
      });

      console.log(`Inserted ${i + students.length} students`);
    }

    console.log("✅ Seeding completed");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStudents();