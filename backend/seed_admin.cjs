const argon2 = require('argon2');
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/sad_alerte' 
});

async function seed() {
  try {
    const hash = await argon2.hash('Admin123456');
    await pool.query(`
      INSERT INTO utilisateur (nom, prenom, email, role, password_hash) 
      VALUES ('Admin', 'Super', 'admin@sad.local', 'admin', $1)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, [hash]);
    console.log('Admin seeded successfully.');
    console.log('Email: admin@sad.local');
    console.log('Password: Admin123456');
  } catch (err) {
    console.error("ERREUR SQL:", err);
  } finally {
    await pool.end();
  }
}

seed();
