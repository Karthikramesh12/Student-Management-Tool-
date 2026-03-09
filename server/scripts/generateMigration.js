#!/usr/bin/env node
const { exec } = require("child_process");
const path = require("path");

// Get migration name
const migrationName = process.argv[2];

if (!migrationName) {
  console.error("❌ Please provide a migration name, e.g., npm run gen:migration add_posts_table");
  console.error("📋 Good migration names describe the change:");
  console.error("   - add_users_table");
  console.error("   - add_email_to_users");
  console.error("   - create_posts_and_comments");
  console.error("   - update_user_permissions");
  process.exit(1);
}

// Validate migration name format
if (!/^[a-zA-Z0-9_]+$/.test(migrationName)) {
  console.error("❌ Migration name should only contain letters, numbers, and underscores");
  process.exit(1);
}

console.log(`🚀 Generating migration: ${migrationName}`);
console.log("📋 This will:");
console.log("   1. Compare your schema.prisma with the current database");
console.log("   2. Generate SQL migration files");
console.log("   3. Apply the migration to your database");
console.log("   4. Update Prisma Client");

// Run prisma migrate dev with the migration name
const command = `npx prisma migrate dev --name ${migrationName}`;

console.log(`\n⏳ Running: ${command}`);

exec(command, { cwd: path.join(__dirname, "..") }, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Migration failed:`);
    console.error(error.message);
    return;
  }

  if (stderr) {
    console.error(`⚠️  Warnings:`);
    console.error(stderr);
  }

  console.log(stdout);
  console.log(`✅ Migration '${migrationName}' completed successfully!`);
  console.log(`📁 Check prisma/migrations/ folder for the generated files`);
});