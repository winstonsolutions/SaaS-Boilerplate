import { createId } from '@paralleldrive/cuid2';
import { addMonths } from 'date-fns';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import type { License, LicenseActivationResponse } from '@/types/Subscription';

/**
 * License服务 - 处理许可证的生成、验证和激活
 */
export class LicenseService {
  /**
   * 生成新的license key
   * 格式: PDFPRO-XXXX-XXXX-XXXX-XXXX
   */
  static generateLicenseKey(): string {
    // 生成随机ID
    const randomId = createId();

    // 从随机ID中提取4个部分，每部分4个字符
    const parts = [];
    // 增加到5组，以便生成4组带连字符的部分
    for (let i = 0; i < 5; i++) {
      parts.push(randomId.substring(i * 4, (i + 1) * 4).toUpperCase());
    }

    // 组合成license key格式
    return `PDFPRO-${parts.join('-')}`;
  }

  /**
   * 创建新的license
   * @param userId 用户ID
   * @param email 用户邮箱
   * @param planType 订阅类型 (monthly/yearly)
   * @param months 订阅月数
   */
  static async createLicense(
    userId: string,
    email: string,
    planType: string = 'monthly',
    months: number = 1,
  ): Promise<License | null> {
    try {
      // 首先检查用户是否已经有最近创建的license
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: existingLicenses, error: searchError } = await db
        .from('licenses')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!searchError && existingLicenses && existingLicenses.length > 0) {
        const existingLicense = existingLicenses[0];

        // 额外验证：确保返回的license确实属于当前用户
        if (existingLicense.user_id === userId) {
          logger.info({
            userId,
            licenseId: existingLicense.id,
            licenseKey: existingLicense.license_key,
          }, '用户已有最近创建的license，避免重复创建');

          return {
            id: existingLicense.id,
            userId: existingLicense.user_id,
            licenseKey: existingLicense.license_key,
            expiresAt: existingLicense.expires_at,
            createdAt: existingLicense.created_at,
            active: existingLicense.active,
            planType: existingLicense.plan_type,
          };
        } else {
          logger.warn({
            userId,
            foundUserId: existingLicense.user_id,
            licenseId: existingLicense.id,
          }, '找到的license用户ID不匹配，继续创建新license');
        }
      }

      // 生成license key
      const licenseKey = this.generateLicenseKey();

      // 计算过期日期
      const expiresAt = addMonths(new Date(), months);

      // 存储到数据库
      const { data, error } = await db
        .from('licenses')
        .insert({
          user_id: userId,
          license_key: licenseKey,
          expires_at: expiresAt.toISOString(),
          active: false,
          plan_type: planType,
          email,
        })
        .select()
        .single();

      if (error) {
        logger.error({ error }, '创建license失败');
        return null;
      }

      // 返回license对象
      return {
        id: data.id,
        userId: data.user_id,
        licenseKey: data.license_key,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        active: data.active,
        planType: data.plan_type,
      };
    } catch (error) {
      logger.error({ error }, '创建license时出错');
      return null;
    }
  }

  /**
   * 验证license key是否有效
   */
  static async validateLicenseKey(licenseKey: string): Promise<boolean> {
    try {
      // 从数据库中查找license
      const { data, error } = await db
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .eq('active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // 检查是否过期
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();

        if (expiresAt < now) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error({ error }, '验证license key时出错');
      return false;
    }
  }

  /**
   * 激活license key并绑定到用户
   */
  static async activateLicense(
    licenseKey: string,
    userId: string,
  ): Promise<LicenseActivationResponse> {
    try {
      // 首先直接查询license而不是用validateLicenseKey，因为我们需要激活未激活的license
      const { data: licenseData, error: licenseError } = await db
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .single();

      if (licenseError || !licenseData) {
        return {
          success: false,
          message: '无效的license key',
        };
      }

      // 检查license是否已经激活
      if (licenseData.active) {
        return {
          success: false,
          message: 'License已经激活，请勿重复激活',
        };
      }

      // 检查是否过期
      if (licenseData.expires_at) {
        const expiresAt = new Date(licenseData.expires_at);
        const now = new Date();

        if (expiresAt < now) {
          return {
            success: false,
            message: 'License已过期',
          };
        }
      }

      // 如果license已绑定其他用户，不允许激活
      if (licenseData.user_id && licenseData.user_id !== userId) {
        return {
          success: false,
          message: 'License key已被其他账户使用',
        };
      }

      // 激活license并绑定用户
      const { error: activateError } = await db
        .from('licenses')
        .update({
          user_id: userId,
          active: true,
        })
        .eq('license_key', licenseKey);

      if (activateError) {
        return {
          success: false,
          message: '激活license失败',
        };
      }

      // 更新用户订阅信息
      const { error: userUpdateError } = await db
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_start_at: new Date().toISOString(),
          subscription_end_at: licenseData.expires_at,
        })
        .eq('id', userId);

      if (userUpdateError) {
        return {
          success: false,
          message: '更新用户订阅信息失败',
        };
      }

      return {
        success: true,
        message: 'License激活成功',
      };
    } catch (error) {
      logger.error({ error }, '激活license时出错');
      return {
        success: false,
        message: '激活过程中发生错误',
      };
    }
  }

  /**
   * 查询用户的所有licenses
   */
  static async getUserLicenses(userId: string): Promise<License[]> {
    try {
      const { data, error } = await db
        .from('licenses')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error({ error }, '查询用户licenses失败');
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        licenseKey: item.license_key,
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        active: item.active,
        planType: item.plan_type,
      }));
    } catch (error) {
      logger.error({ error }, '查询用户licenses时出错');
      return [];
    }
  }
}
