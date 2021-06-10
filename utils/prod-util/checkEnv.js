module.exports = checkEnv = () => {
  const errors = [];
  if (!process.env.DB_PASS)
    errors.push("Database password missing from env variables.");
  if (!process.env.AUTH_SECRET)
    errors.push("Encrypting string missing from env variables.");

  if (errors.length === 0) return;
  console.log("\n\x1b[1m%s\x1b[0m", "Aborting due to following errors:\n");
  errors.map((err) => console.log("\x1b[31mError : %s\x1b[0m", err));
  process.exit(1);
};
