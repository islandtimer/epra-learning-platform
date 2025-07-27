const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets not configured');
}

class JWTUtil {
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'epra-backend',
      audience: 'epra-frontend'
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'epra-backend',
        audience: 'epra-frontend'
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static async storeRefreshToken(userId, refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    
    // Parse refresh token expiration
    const expirationMatch = REFRESH_TOKEN_EXPIRES_IN.match(/(\d+)([dwh])/);
    if (expirationMatch) {
      const [, amount, unit] = expirationMatch;
      const multiplier = { d: 24 * 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000, h: 60 * 60 * 1000 };
      expiresAt.setTime(expiresAt.getTime() + (parseInt(amount) * multiplier[unit]));
    } else {
      expiresAt.setTime(expiresAt.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days
    }

    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await db.query(query, [userId, hashedToken, expiresAt]);
    return result.rows[0];
  }

  static async verifyRefreshToken(refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const query = `
      SELECT rt.*, u.id as user_id, u.email, u.role
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = $1 
        AND rt.expires_at > CURRENT_TIMESTAMP 
        AND rt.revoked = false
        AND u.is_active = true
    `;
    
    const result = await db.query(query, [hashedToken]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid or expired refresh token');
    }
    
    return result.rows[0];
  }

  static async revokeRefreshToken(refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const query = `
      UPDATE refresh_tokens 
      SET revoked = true 
      WHERE token_hash = $1
    `;
    
    await db.query(query, [hashedToken]);
  }

  static async revokeAllUserTokens(userId) {
    const query = `
      UPDATE refresh_tokens 
      SET revoked = true 
      WHERE user_id = $1 AND revoked = false
    `;
    
    await db.query(query, [userId]);
  }

  static async cleanupExpiredTokens() {
    const query = `
      DELETE FROM refresh_tokens 
      WHERE expires_at <= CURRENT_TIMESTAMP OR revoked = true
    `;
    
    const result = await db.query(query);
    return result.rowCount;
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }
    
    return authHeader.substring(7);
  }
}

module.exports = JWTUtil;