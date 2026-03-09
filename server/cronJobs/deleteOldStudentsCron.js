const cron = require("node-cron");
const deleteOldStudents = require("./jobs/deleteOldStudents.js");

function startCronJobs() {

  // runs every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("Running student cleanup job...");
    await deleteOldStudents();
  });

}

module.exports = startCronJobs;