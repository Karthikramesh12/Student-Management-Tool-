const prisma = require("../../config/dbConnect");

async function deleteOldStudents() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.student.deleteMany({
      where: {
        status: "DELETED",
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Deleted ${result.count} old students`);
  } catch (error) {
    console.error("Error deleting old students:", error);
  }
}

module.exports = deleteOldStudents;