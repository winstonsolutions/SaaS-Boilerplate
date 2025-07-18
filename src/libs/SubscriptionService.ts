import { addDays } from 'date-fns';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import type { SubscriptionStatus, UserSubscriptionStatus } from '@/types/Subscription';
import { TRIAL_DAYS } from '@/utils/SubscriptionConfig';
import { determineUserStatus, isInTrialPeriod, isSubscriptionActive } from '@/utils/SubscriptionHelpers';

/**
 * 订阅服务 - 处理用户订阅状态
 */
export class SubscriptionService {
  /**
   * 获取用户信息
   * @param clerkId Clerk用户ID
   */
  static async getUserInfo(clerkId: string) {
    try {
      const { data: user, error } = await db
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        logger.error({ error, clerkId }, '查询用户信息失败');
        return null;
      }

      return user;
    } catch (error) {
      logger.error({ error }, '获取用户信息时出错');
      return null;
    }
  }

  /**
   * 获取用户订阅状态
   */
  static async getUserSubscriptionStatus(clerkId: string): Promise<UserSubscriptionStatus | null> {
    try {
      // 从数据库中查询用户
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (userError || !user) {
        console.error('查询用户失败:', userError);
        return null;
      }

      // 获取用户的licenses
      const { data: licenses, error: licenseError } = await db
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('expires_at', { ascending: false });

      if (licenseError) {
        console.error('查询用户licenses失败:', licenseError);
        // 不中断流程，licenses可能为空
      }

      // 获取最近的license
      const latestLicense = licenses && licenses.length > 0 ? licenses[0] : null;

      // 确定用户状态
      const status = determineUserStatus(
        user.trial_started_at,
        user.subscription_expires_at || (latestLicense?.expires_at ?? null),
      );

      // 计算试用期结束时间
      let trialEndsAt: string | null = null;
      if (user.trial_started_at) {
        const trialStartDate = new Date(user.trial_started_at);
        const trialEndDate = addDays(trialStartDate, TRIAL_DAYS);
        trialEndsAt = trialEndDate.toISOString();
      }

      // 构建状态响应
      return {
        isLoggedIn: true,
        accountStatus: status,
        isPro: status === 'pro' || status === 'trial',
        isTrialActive: isInTrialPeriod(user.trial_started_at),
        trialEndsAt,
        subscriptionEndsAt: user.subscription_expires_at || (latestLicense?.expires_at ?? null),
        email: user.email,
        licenseKey: latestLicense?.license_key,
      };
    } catch (error) {
      console.error('获取用户订阅状态出错:', error);
      return null;
    }
  }

  /**
   * 开始用户试用期
   */
  static async startUserTrial(clerkId: string): Promise<boolean> {
    try {
      // 检查用户是否存在
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (userError || !user) {
        console.error('查询用户失败:', userError);
        return false;
      }

      // 检查用户是否已经开始试用或有订阅
      if (user.trial_started_at || user.subscription_status === 'pro') {
        return false; // 已经开始试用或已是付费用户
      }

      // 更新用户试用状态
      const { error: updateError } = await db
        .from('users')
        .update({
          trial_started_at: new Date().toISOString(),
          subscription_status: 'trial',
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('更新用户试用状态失败:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('开始用户试用期出错:', error);
      return false;
    }
  }

  /**
   * 获取用户的订阅详情
   */
  static async getSubscriptionDetails(clerkId: string): Promise<{
    status: SubscriptionStatus;
    daysRemaining: number;
    expiresAt: string | null;
  } | null> {
    try {
      const userStatus = await this.getUserSubscriptionStatus(clerkId);

      if (!userStatus) {
        return null;
      }

      let expiresAt: string | null = null;
      let daysRemaining = 0;

      // 根据状态确定过期时间
      if (userStatus.accountStatus === 'pro') {
        expiresAt = userStatus.subscriptionEndsAt;
      } else if (userStatus.accountStatus === 'trial') {
        expiresAt = userStatus.trialEndsAt;
      }

      // 计算剩余天数
      if (expiresAt) {
        const endDate = new Date(expiresAt);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = daysRemaining > 0 ? daysRemaining : 0;
      }

      return {
        status: userStatus.accountStatus,
        daysRemaining,
        expiresAt,
      };
    } catch (error) {
      console.error('获取用户订阅详情出错:', error);
      return null;
    }
  }

  /**
   * 检查用户是否有Pro权限（在试用期内或有有效订阅）
   */
  static async hasProAccess(clerkId: string): Promise<boolean> {
    try {
      // 从数据库中查询用户
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (userError || !user) {
        return false;
      }

      // 检查是否在试用期内
      const inTrialPeriod = isInTrialPeriod(user.trial_started_at);

      // 检查订阅是否有效
      const hasActiveSubscription = isSubscriptionActive(user.subscription_expires_at);

      return inTrialPeriod || hasActiveSubscription;
    } catch (error) {
      console.error('检查用户Pro权限出错:', error);
      return false;
    }
  }

  /**
   * 检查并更新过期的订阅
   */
  static async updateExpiredSubscriptions(): Promise<number> {
    try {
      const now = new Date().toISOString();

      // 更新过期的试用账户
      const trialEndDate = addDays(new Date(), -TRIAL_DAYS).toISOString();

      // 记录试用期查询SQL
      logger.info({
        table: 'users',
        filter: {
          trial_started_at_lt: trialEndDate,
          subscription_status: 'trial',
        },
        query: `UPDATE users SET subscription_status = 'expired'
                WHERE trial_started_at < '${trialEndDate}'
                AND subscription_status = 'trial'
                RETURNING id`,
      }, '更新过期试用账户SQL');

      const { data: expiredTrials, error: trialError } = await db
        .from('users')
        .update({ subscription_status: 'expired' })
        .lt('trial_started_at', trialEndDate)
        .eq('subscription_status', 'trial')
        .select('id');

      if (trialError) {
        console.error('更新过期试用账户失败:', trialError);
        logger.error({ error: trialError }, '更新过期试用账户失败');
      } else {
        logger.info({ count: expiredTrials?.length || 0 }, '更新的过期试用账户数量');
      }

      // 记录订阅过期查询SQL
      logger.info({
        table: 'users',
        filter: {
          subscription_expires_at_lt: now,
          subscription_status: 'pro',
        },
        query: `UPDATE users SET subscription_status = 'expired'
                WHERE subscription_expires_at < '${now}'
                AND subscription_status = 'pro'
                RETURNING id`,
      }, '更新过期订阅账户SQL');

      // 更新过期的订阅账户
      const { data: expiredSubs, error: subError } = await db
        .from('users')
        .update({ subscription_status: 'expired' })
        .lt('subscription_expires_at', now)
        .eq('subscription_status', 'pro')
        .select('id');

      if (subError) {
        console.error('更新过期订阅账户失败:', subError);
        logger.error({ error: subError }, '更新过期订阅账户失败');
      } else {
        logger.info({ count: expiredSubs?.length || 0 }, '更新的过期订阅账户数量');
      }

      // 返回更新的总记录数
      const trialCount = expiredTrials?.length || 0;
      const subCount = expiredSubs?.length || 0;
      return trialCount + subCount;
    } catch (error) {
      console.error('更新过期订阅出错:', error);
      return 0;
    }
  }
}
