const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/sad_alerte',
});

async function check() {
  try {
    await pool.query(`SELECT * FROM password_reset_token LIMIT 1`);
    console.log('Table exists');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

check();
