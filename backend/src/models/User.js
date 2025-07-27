const db = require('../database/connection');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, firstName, lastName, organization, role = 'learner' }) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, organization, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, organization, role, is_active, created_at
    `;
    
    const values = [email, hashedPassword, firstName, lastName, organization, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, organization, role, is_active, 
             email_verified, created_at, updated_at, last_login
      FROM users WHERE id = $1 AND is_active = true
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  static async updateProfile(id, updates) {
    const allowedFields = ['first_name', 'last_name', 'organization'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, organization, role, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await db.query(query, [hashedPassword, id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async deactivate(id) {
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = User;