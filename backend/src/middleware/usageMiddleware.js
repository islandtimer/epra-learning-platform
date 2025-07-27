const db = require('../database/connection');
const logger = require('../utils/logger');

const trackApiUsage = (provider) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    res.end = function(chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);
      
      // Track usage after response is sent
      setImmediate(async () => {
        try {
          const duration = Date.now() - startTime;
          const userId = req.user?.id;
          const endpoint = req.route?.path || req.path;
          
          if (userId && res.statusCode < 400) {
            // Extract usage info from response if available
            let tokensUsed = 0;
            let costCents = 0;
            
            // Try to extract from response body (if it's JSON)
            if (chunk && res.getHeader('content-type')?.includes('application/json')) {
              try {
                const responseData = JSON.parse(chunk.toString());
                tokensUsed = responseData.data?.usage?.output_tokens || 
                            responseData.data?.usage?.total_tokens || 0;
                
                // Rough cost estimation (adjust based on actual provider pricing)
                if (provider === 'claude') {
                  costCents = Math.ceil(tokensUsed * 0.003); // ~$3 per 1000 tokens
                } else if (provider === 'perplexity') {
                  costCents = Math.ceil(tokensUsed * 0.002); // ~$2 per 1000 tokens
                }
              } catch (error) {
                // Ignore JSON parsing errors
              }
            }
            
            await recordApiUsage(userId, endpoint, provider, tokensUsed, costCents);
            
            logger.info('API usage tracked', {
              userId,
              provider,
              endpoint,
              tokensUsed,
              costCents,
              duration,
              statusCode: res.statusCode
            });
          }
        } catch (error) {
          logger.error('Failed to track API usage:', error);
        }
      });
    };
    
    next();
  };
};

async function recordApiUsage(userId, endpoint, provider, tokensUsed, costCents) {
  try {
    const query = `
      INSERT INTO api_usage (user_id, endpoint, provider, tokens_used, cost_cents)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await db.query(query, [userId, endpoint, provider, tokensUsed, costCents]);
  } catch (error) {
    logger.error('Failed to record API usage:', error);
  }
}

const checkUsageLimits = (dailyLimit = 1000, monthlyLimit = 10000) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return next();
      }
      
      // Check daily usage
      const dailyQuery = `
        SELECT COALESCE(SUM(tokens_used), 0) as daily_usage
        FROM api_usage
        WHERE user_id = $1 AND created_at >= CURRENT_DATE
      `;
      
      const dailyResult = await db.query(dailyQuery, [userId]);
      const dailyUsage = parseInt(dailyResult.rows[0].daily_usage);
      
      if (dailyUsage >= dailyLimit) {
        return res.status(429).json({
          success: false,
          message: 'Daily usage limit exceeded',
          limits: {
            daily: { used: dailyUsage, limit: dailyLimit },
            resetTime: new Date().setHours(24, 0, 0, 0)
          }
        });
      }
      
      // Check monthly usage
      const monthlyQuery = `
        SELECT COALESCE(SUM(tokens_used), 0) as monthly_usage
        FROM api_usage
        WHERE user_id = $1 AND created_at >= date_trunc('month', CURRENT_DATE)
      `;
      
      const monthlyResult = await db.query(monthlyQuery, [userId]);
      const monthlyUsage = parseInt(monthlyResult.rows[0].monthly_usage);
      
      if (monthlyUsage >= monthlyLimit) {
        return res.status(429).json({
          success: false,
          message: 'Monthly usage limit exceeded',
          limits: {
            monthly: { used: monthlyUsage, limit: monthlyLimit },
            resetTime: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        });
      }
      
      // Add usage info to request for logging
      req.usageInfo = {
        daily: { used: dailyUsage, limit: dailyLimit },
        monthly: { used: monthlyUsage, limit: monthlyLimit }
      };
      
      next();
    } catch (error) {
      logger.error('Usage limit check failed:', error);
      next(); // Continue on error to avoid blocking requests
    }
  };
};

const getUserUsageStats = async (userId, days = 30) => {
  try {
    const query = `
      SELECT 
        provider,
        DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(tokens_used) as tokens,
        SUM(cost_cents) as cost_cents
      FROM api_usage
      WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY provider, DATE(created_at)
      ORDER BY date DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get usage stats:', error);
    return [];
  }
};

module.exports = {
  trackApiUsage,
  checkUsageLimits,
  getUserUsageStats
};