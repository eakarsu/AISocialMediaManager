'use strict';
const bcrypt = require('bcryptjs');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../src/db');

async function prepare() {
  if (!['1', 'true'].includes(String(process.env.ALLOW_SCHEMA_MIGRATION || '').toLowerCase())) {
    throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  }
  const migration = fs.readFileSync(path.resolve(__dirname, '../migrations/001_governed_social_media.sql'), 'utf8');
  await pool.query(migration);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_ai_results (
      id BIGSERIAL PRIMARY KEY,
      tenant_id BIGINT NOT NULL REFERENCES social_tenants(id),
      user_id BIGINT NOT NULL REFERENCES social_users(id),
      endpoint TEXT NOT NULL,
      input_data JSONB NOT NULL,
      result JSONB NOT NULL,
      model_used TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS social_ai_results_lookup_idx
      ON social_ai_results(tenant_id, user_id, endpoint, created_at DESC);
  `);

  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Admin';
  if (!email || String(password || '').length < 12) throw new Error('Provisioned admin credentials are required');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await pool.query(
    `INSERT INTO social_users(email,password_hash,name) VALUES($1,$2,$3)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name
     RETURNING id`,
    [email, passwordHash, name],
  );
  const tenantName = process.env.BOOTSTRAP_TENANT_NAME || 'Runtime Tenant';
  let tenant = await pool.query('SELECT id FROM social_tenants WHERE name=$1 ORDER BY id LIMIT 1', [tenantName]);
  if (!tenant.rows[0]) tenant = await pool.query('INSERT INTO social_tenants(name) VALUES($1) RETURNING id', [tenantName]);
  await pool.query(
    `INSERT INTO social_memberships(tenant_id,user_id,role,active) VALUES($1,$2,'admin',TRUE)
     ON CONFLICT(tenant_id,user_id) DO UPDATE SET role='admin',active=TRUE`,
    [tenant.rows[0].id, user.rows[0].id],
  );
}

prepare()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Runtime preparation failed:', error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
