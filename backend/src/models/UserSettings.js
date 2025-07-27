const db = require('../database/connection');

class UserSettings {
  static async create(userId, settings = {}) {
    const {
      language = 'en',
      theme = 'light',
      notificationsEnabled = true
    } = settings;

    const query = `
      INSERT INTO user_settings (user_id, language, theme, notifications_enabled)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        language = EXCLUDED.language,
        theme = EXCLUDED.theme,
        notifications_enabled = EXCLUDED.notifications_enabled,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [userId, language, theme, notificationsEnabled];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_settings WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async update(userId, updates) {
    const allowedFields = ['language', 'theme', 'notifications_enabled'];
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

    values.push(userId);
    const query = `
      UPDATE user_settings 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(userId) {
    const query = 'DELETE FROM user_settings WHERE user_id = $1 RETURNING *';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async getOrCreate(userId) {
    let settings = await this.findByUserId(userId);
    if (!settings) {
      settings = await this.create(userId);
    }
    return settings;
  }
}

module.exports = UserSettings;