import { createId } from '@paralleldrive/cuid2';
import { addMonths } from 'date-fns';

import { db } from '@/libs/DB';
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
    for (let i = 0; i < 4; i++) {
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
          active: true,
          plan_type: planType,
          email,
        })
        .select()
        .single();

      if (error) {
        console.error('创建license失败:', error);
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
      console.error('创建license时出错:', error);
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
      console.error('验证license key时出错:', error);
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
      // 验证license key
      const isValid = await this.validateLicenseKey(licenseKey);

      if (!isValid) {
        return {
          success: false,
          message: '无效的license key或已过期',
        };
      }

      // 查询license详情
      const { data: licenseData, error: licenseError } = await db
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .single();

      if (licenseError || !licenseData) {
        return {
          success: false,
          message: '找不到license信息',
        };
      }

      // 如果license已绑定其他用户，不允许激活
      if (licenseData.user_id && licenseData.user_id !== userId) {
        return {
          success: false,
          message: 'License key已被其他账户使用',
        };
      }

      // 如果尚未绑定用户，则进行绑定
      if (!licenseData.user_id) {
        const { error: updateError } = await db
          .from('licenses')
          .update({ user_id: userId })
          .eq('license_key', licenseKey);

        if (updateError) {
          return {
            success: false,
            message: '激活license失败',
          };
        }
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
      console.error('激活license时出错:', error);
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
        console.error('查询用户licenses失败:', error);
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
      console.error('查询用户licenses时出错:', error);
      return [];
    }
  }
}
