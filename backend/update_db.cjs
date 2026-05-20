const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/sad_alerte',
});

async function updateDb() {
  try {
    await pool.query(`
      ALTER TABLE utilisateur 
      ADD COLUMN IF NOT EXISTS matricule VARCHAR(255),
      ADD COLUMN IF NOT EXISTS unite VARCHAR(255),
      ADD COLUMN IF NOT EXISTS zone_affectation VARCHAR(255);
    `);
    console.log('Columns added successfully');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    pool.end();
  }
}

updateDb();
