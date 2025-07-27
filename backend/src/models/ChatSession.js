const db = require('../database/connection');

class ChatSession {
  static async create(userId, title = 'New Chat') {
    const query = `
      INSERT INTO chat_sessions (user_id, title)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [userId, title]);
    return result.rows[0];
  }

  static async findById(sessionId, userId) {
    const query = `
      SELECT * FROM chat_sessions
      WHERE id = $1 AND user_id = $2
    `;
    const result = await db.query(query, [sessionId, userId]);
    return result.rows[0];
  }

  static async getUserSessions(userId, limit = 50) {
    const query = `
      SELECT 
        cs.*,
        COUNT(cm.id) as message_count,
        MAX(cm.created_at) as last_message_at
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = $1
      GROUP BY cs.id
      ORDER BY cs.updated_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  static async updateTitle(sessionId, userId, title) {
    const query = `
      UPDATE chat_sessions 
      SET title = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await db.query(query, [title, sessionId, userId]);
    return result.rows[0];
  }

  static async delete(sessionId, userId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Delete messages first (due to foreign key constraint)
      await client.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
      
      // Delete session
      const result = await client.query(
        'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
        [sessionId, userId]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async addMessage(sessionId, role, content, metadata = {}) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Add message
      const messageQuery = `
        INSERT INTO chat_messages (session_id, role, content, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const messageResult = await client.query(messageQuery, [sessionId, role, content, JSON.stringify(metadata)]);
      
      // Update session timestamp
      await client.query(
        'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sessionId]
      );
      
      await client.query('COMMIT');
      return messageResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMessages(sessionId, userId, limit = 100) {
    // First verify user owns the session
    const sessionCheck = await this.findById(sessionId, userId);
    if (!sessionCheck) {
      throw new Error('Session not found or access denied');
    }

    const query = `
      SELECT * FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `;
    const result = await db.query(query, [sessionId, limit]);
    return result.rows.map(row => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }

  static async getSessionStats(userId) {
    const query = `
      SELECT 
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cm.id) as total_messages,
        COALESCE(AVG(msg_count.count), 0) as avg_messages_per_session
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      LEFT JOIN (
        SELECT session_id, COUNT(*) as count
        FROM chat_messages
        GROUP BY session_id
      ) msg_count ON cs.id = msg_count.session_id
      WHERE cs.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = ChatSession;