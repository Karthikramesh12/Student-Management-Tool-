#!/usr/bin/env node
const { exec } = require("child_process");
const path = require("path");

console.log("🚀 Deploying database migrations...");
console.log("📋 This will:");
console.log("   1. Apply all pending migrations to the database");
console.log("   2. Update the _prisma_migrations table");
console.log("   3. Does NOT create new migrations");
console.log("");
console.log("⚠️  Note: This is for production/deployment only!");
console.log("   For development, use: npm run gen:migration <name>");
console.log("");

// Run prisma migrate deploy
const command = `npx prisma migrate deploy`;

console.log(`⏳ Running: ${command}\n`);

exec(command, { cwd: path.join(__dirname, "..") }, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Migration deployment failed:`);
    console.error(error.message);
    process.exit(1);
  }

  if (stderr) {
    console.error(`⚠️  Warnings:`);
    console.error(stderr);
  }

  console.log(stdout);
  console.log(`✅ All migrations deployed successfully!`);
  console.log(`📊 Database is now in sync with your schema`);
});
