import pool from '../config/database';
import { Badge, UserBadge, BadgeProgress } from '../types';

export class BadgeService {
  
  // Get user's progress for all badge categories (for the popup modal)
  static async getUserBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const categories = ['clubs', 'notes', 'marketplace'] as const;
    const progress: BadgeProgress[] = [];
    
    // Get user's current counts
    const counts = await this.getUserCounts(userId);
    
    for (const category of categories) {
      // Get all badges for this category with user's earned status
      const query = `
        SELECT b.*, 
               ub.earned_at,
               CASE WHEN ub.user_id IS NOT NULL THEN true ELSE false END as earned
        FROM badges b
        LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
        WHERE b.category = $2
        ORDER BY b.requirement_count ASC
      `;
      
      const result = await pool.query(query, [userId, category]);
      
      const badges = result.rows.map((row: any) => ({
        badge: {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          tier: row.tier,
          requirement_count: row.requirement_count,
          created_at: row.created_at
        },
        earned: row.earned,
        earned_at: row.earned_at
      }));
      
      progress.push({
        category,
        current_count: counts[category],
        badges
      });
    }
    
    return progress;
  }

  // Check and award badges for a specific category (called after user actions)
  static async checkAndAwardBadges(userId: string, category: 'clubs' | 'notes' | 'marketplace'): Promise<Badge[]> {
    const counts = await this.getUserCounts(userId);
    const currentCount = counts[category];
    
    // Get badges user should have for this category
    const badgesQuery = `
      SELECT * FROM badges 
      WHERE category = $1 AND requirement_count <= $2
      ORDER BY requirement_count ASC
    `;
    const badgesResult = await pool.query(badgesQuery, [category, currentCount]);
    const eligibleBadges = badgesResult.rows;
    
    // Get badges user already has
    const userBadgesQuery = `
      SELECT badge_id FROM user_badges 
      WHERE user_id = $1 AND badge_id = ANY($2)
    `;
    const badgeIds = eligibleBadges.map((b: any) => b.id);
    const userBadgesResult = await pool.query(userBadgesQuery, [userId, badgeIds]);
    const earnedBadgeIds = userBadgesResult.rows.map((row: any) => row.badge_id);
    
    // Find new badges to award
    const newBadges = eligibleBadges.filter((badge: any) => !earnedBadgeIds.includes(badge.id));
    
    // Award new badges
    for (const badge of newBadges) {
      await this.awardBadge(userId, badge.id);
    }
    
    return newBadges.map((badge: any) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      tier: badge.tier,
      requirement_count: badge.requirement_count,
      created_at: badge.created_at
    }));
  }

  // Get user's earned badges
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    const query = `
      SELECT ub.*, b.name, b.description, b.category, b.tier, 
             b.requirement_count, b.created_at as badge_created_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = $1
      ORDER BY ub.earned_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      badge_id: row.badge_id,
      earned_at: row.earned_at,
      badge: {
        id: row.badge_id,
        name: row.name,
        description: row.description,
        category: row.category,
        tier: row.tier,
        requirement_count: row.requirement_count,
        created_at: row.badge_created_at
      }
    }));
  }

  // Private: Count user's activities
  private static async getUserCounts(userId: string): Promise<{clubs: number, notes: number, marketplace: number}> {
    // Count clubs joined
    const clubsQuery = 'SELECT COUNT(*) FROM club_members WHERE user_id = $1';
    const clubsResult = await pool.query(clubsQuery, [userId]);
    const clubs = parseInt(clubsResult.rows[0].count);
    
    // Count notes posted
    const notesQuery = 'SELECT COUNT(*) FROM notes WHERE uploader_id = $1';
    const notesResult = await pool.query(notesQuery, [userId]);
    const notes = parseInt(notesResult.rows[0].count);
    
    // Count marketplace posts
    const marketplaceQuery = 'SELECT COUNT(*) FROM marketplace_posts WHERE creator_id = $1';
    const marketplaceResult = await pool.query(marketplaceQuery, [userId]);
    const marketplace = parseInt(marketplaceResult.rows[0].count);
    
    return { clubs, notes, marketplace };
  }

  // Private: Award a specific badge to user
  private static async awardBadge(userId: string, badgeId: string): Promise<void> {
    const query = `
      INSERT INTO user_badges (user_id, badge_id) 
      VALUES ($1, $2)
      ON CONFLICT (user_id, badge_id) DO NOTHING
    `;
    await pool.query(query, [userId, badgeId]);
  }
}