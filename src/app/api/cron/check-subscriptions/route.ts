import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { EmailService } from '@/libs/EmailService';
import { logger } from '@/libs/Logger';
import { SubscriptionService } from '@/libs/SubscriptionService';

/**
 * 定时检查订阅状态的API端点
 * 设计为由cron任务定期调用(如每天凌晨)
 * 检查即将过期的订阅并发送提醒邮件
 * 更新已经过期的订阅状态
 */
export async function GET(req: Request) {
  // 验证是否来自Vercel的定时任务
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    logger.warn('未授权的cron请求');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 更新过期的订阅
    const updatedCount = await SubscriptionService.updateExpiredSubscriptions();
    logger.info({ count: updatedCount }, '更新过期订阅完成');

    // 查找即将在3天内过期的试用用户
    // 试用期7天，剩余3天内意味着已试用4-7天
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data: trialUsers, error: trialError } = await db
      .from('users')
      .select('*')
      .eq('subscription_status', 'trial')
      .lte('trial_started_at', fourDaysAgo.toISOString())
      .gte('trial_started_at', sevenDaysAgo.toISOString());

    if (trialError) {
      logger.error({ error: trialError }, '查询即将过期的试用用户失败');
    } else {
      // 发送试用即将结束提醒
      for (const user of trialUsers || []) {
        const trialStartDate = new Date(user.trial_started_at);
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialStartDate.getDate() + 7); // 7天试用期

        const now = new Date();
        const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining > 0 && daysRemaining <= 3) {
          // 发送提醒邮件
          await EmailService.sendTrialEndingSoon(
            user.email,
            daysRemaining,
            trialEndDate.toISOString(),
          );

          logger.info(
            { userId: user.id, daysRemaining },
            '已发送试用即将结束提醒',
          );
        }
      }
    }

    // 查找即将在7天内过期的付费用户，每天发送提醒
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { data: proUsers, error: proError } = await db
      .from('users')
      .select('*')
      .eq('subscription_status', 'pro')
      .lt('subscription_expires_at', sevenDaysLater.toISOString())
      .gt('subscription_expires_at', new Date().toISOString()); // 还没过期

    if (proError) {
      logger.error({ error: proError }, '查询即将过期的订阅用户失败');
    } else {
      // 发送订阅即将到期提醒，7天内每天都发送
      for (const user of proUsers || []) {
        const endDate = new Date(user.subscription_expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // 7天内每天都发送提醒
        if (daysRemaining > 0 && daysRemaining <= 7) {
          // 发送提醒邮件
          await EmailService.sendSubscriptionEndingSoon(
            user.email,
            daysRemaining,
            endDate.toISOString(),
          );

          logger.info(
            { userId: user.id, daysRemaining },
            '已发送订阅即将到期提醒',
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      trialRemindersSent: trialUsers?.length || 0,
      subscriptionRemindersSent: proUsers?.length || 0,
    });
  } catch (error) {
    logger.error({ error }, '检查订阅状态时出错');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
