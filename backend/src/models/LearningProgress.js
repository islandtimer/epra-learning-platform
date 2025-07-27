const db = require('../database/connection');

class LearningProgress {
  static async updateProgress(userId, moduleId, progressData) {
    const { score, totalQuestions, completed, timeSpent } = progressData;
    
    const query = `
      INSERT INTO learning_progress (user_id, module_id, score, total_questions, completed, attempts, time_spent, completed_at)
      VALUES ($1, $2, $3, $4, $5, 1, $6, $7)
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET 
        score = GREATEST(learning_progress.score, EXCLUDED.score),
        total_questions = EXCLUDED.total_questions,
        completed = EXCLUDED.completed OR learning_progress.completed,
        attempts = learning_progress.attempts + 1,
        time_spent = learning_progress.time_spent + EXCLUDED.time_spent,
        completed_at = CASE WHEN EXCLUDED.completed AND NOT learning_progress.completed THEN EXCLUDED.completed_at ELSE learning_progress.completed_at END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const completedAt = completed ? new Date() : null;
    const values = [userId, moduleId, score, totalQuestions, completed, timeSpent, completedAt];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getUserProgress(userId) {
    const query = `
      SELECT module_id, score, total_questions, completed, attempts, time_spent, started_at, completed_at
      FROM learning_progress
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async getModuleProgress(userId, moduleId) {
    const query = `
      SELECT * FROM learning_progress
      WHERE user_id = $1 AND module_id = $2
    `;
    const result = await db.query(query, [userId, moduleId]);
    return result.rows[0];
  }

  static async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as modules_started,
        COUNT(CASE WHEN completed = true THEN 1 END) as modules_completed,
        COALESCE(AVG(score), 0) as average_score,
        COALESCE(SUM(time_spent), 0) as total_time_spent
      FROM learning_progress
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async getGlobalStats() {
    const query = `
      SELECT 
        COUNT(DISTINCT user_id) as active_learners,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN completed = true THEN 1 END) as total_completions,
        COALESCE(AVG(score), 0) as average_score,
        module_id,
        COUNT(*) as attempts_per_module
      FROM learning_progress
      GROUP BY module_id
      ORDER BY attempts_per_module DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async getLeaderboard(limit = 10) {
    const query = `
      SELECT 
        u.first_name,
        u.last_name,
        u.organization,
        COUNT(lp.module_id) as completed_modules,
        COALESCE(AVG(lp.score), 0) as average_score,
        SUM(lp.time_spent) as total_time_spent
      FROM users u
      JOIN learning_progress lp ON u.id = lp.user_id
      WHERE lp.completed = true
      GROUP BY u.id, u.first_name, u.last_name, u.organization
      ORDER BY completed_modules DESC, average_score DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  static async deleteUserProgress(userId) {
    const query = 'DELETE FROM learning_progress WHERE user_id = $1';
    await db.query(query, [userId]);
  }
}

module.exports = LearningProgress;