import argon2 from "argon2";
import { Client } from "pg";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const connectionString = process.argv[4];
  const role = process.argv[5] || "agent";

  if (!email || !password || !connectionString) {
    throw new Error("Usage: node e2e-seed-user.js <email> <password> <connectionString> [role]");
  }

  const allowedRoles = new Set(["agent", "admin"]);
  if (!allowedRoles.has(role)) {
    throw new Error("role must be one of: agent, admin");
  }

  const client = new Client({ connectionString });
  await client.connect();

  const hash = await argon2.hash(password);
  const query = `
    INSERT INTO utilisateur (nom, prenom, email, role, password_hash, actif)
    VALUES ('E2E', 'Utilisateur', $1, $3::user_role, $2, true)
    ON CONFLICT (email)
    DO UPDATE SET password_hash = EXCLUDED.password_hash, actif = true, role = EXCLUDED.role
    RETURNING email
  `;
  const result = await client.query(query, [email, hash, role]);
  await client.end();
  console.log(result.rows[0].email);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e.message);
  process.exit(1);
});
