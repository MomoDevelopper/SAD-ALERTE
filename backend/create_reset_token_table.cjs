const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/sad_alerte',
});

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_token (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('password_reset_token table created successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

createTable();
