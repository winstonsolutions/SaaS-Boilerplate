import { logger } from '@/libs/Logger';
import { formatDate } from '@/utils/SubscriptionHelpers';

/**
 * 邮件服务 - 处理所有与订阅相关的邮件发送
 */
export class EmailService {
  /**
   * 发送一封邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param htmlContent 邮件内容(HTML格式)
   */
  private static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    try {
      // 不论环境，都发送邮件
      logger.info({
        to,
        subject,
        preview: `${htmlContent.substring(0, 100)}...`,
      }, '准备发送邮件');

      // 使用邮件发送服务(如Resend, SendGrid等)
      // 这里以Resend为例
      if (!process.env.RESEND_API_KEY) {
        logger.error('未配置RESEND_API_KEY环境变量');
        return false;
      }

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: `PDF Pro <noreply@${process.env.EMAIL_DOMAIN || 'example.com'}>`,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        logger.error({ error }, '发送邮件失败');
        return false;
      }

      logger.info({ emailId: data?.id }, '邮件发送成功');
      return true;
    } catch (error) {
      logger.error({ error }, '发送邮件时出错');
      return false;
    }
  }

  /**
   * 发送license key邮件
   * @param to 收件人邮箱
   * @param licenseKey License Key
   * @param expiresAt 过期日期
   */
  static async sendLicenseEmail(
    to: string,
    licenseKey: string,
    expiresAt: string | null,
  ): Promise<boolean> {
    const subject = 'PDF Pro - 您的许可证密钥已就绪';

    // 格式化过期日期
    const formattedExpiryDate = expiresAt ? formatDate(expiresAt) : '永久有效';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">感谢您购买 PDF Pro!</h2>
        <p>您的许可证密钥如下:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-family: monospace; margin: 20px 0;">
          ${licenseKey}
        </div>
        <p><strong>过期日期:</strong> ${formattedExpiryDate}</p>
        <p>要激活您的订阅，请登录您的账户并在仪表板页面输入以上许可证密钥。</p>
        <p>如果您有任何问题，请随时联系我们的支持团队。</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  /**
   * 发送订阅确认邮件
   * @param to 收件人邮箱
   * @param planName 计划名称
   * @param expiresAt 过期日期
   */
  static async sendSubscriptionConfirmation(
    to: string,
    planName: string,
    expiresAt: string | null,
  ): Promise<boolean> {
    const subject = 'PDF Pro - 您的订阅已确认';

    const formattedExpiryDate = expiresAt ? formatDate(expiresAt) : '永久有效';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">您的订阅已成功激活!</h2>
        <p>感谢您订阅 PDF Pro。您现在可以使用所有高级功能。</p>
        <p><strong>订阅计划:</strong> ${planName}</p>
        <p><strong>到期日期:</strong> ${formattedExpiryDate}</p>
        <p>您可以随时在仪表板查看您的订阅详情。</p>
        <p>享受 PDF Pro 带来的便利体验!</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  /**
   * 发送试用期开始邮件
   * @param to 收件人邮箱
   * @param trialEndsAt 试用期结束日期
   */
  static async sendTrialStarted(
    to: string,
    trialEndsAt: string,
  ): Promise<boolean> {
    const subject = 'PDF Pro - 您的试用期已开始';

    const formattedEndDate = formatDate(trialEndsAt);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">您的 PDF Pro 试用已开始!</h2>
        <p>感谢您开始试用 PDF Pro。您现在可以使用所有高级功能。</p>
        <p><strong>试用结束日期:</strong> ${formattedEndDate}</p>
        <p>试用结束后，您可以购买订阅以继续使用所有功能。</p>
        <p>如有任何问题，请随时联系我们的支持团队。</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  /**
   * 发送试用期即将结束提醒
   * @param to 收件人邮箱
   * @param daysRemaining 剩余天数
   * @param trialEndsAt 试用期结束日期
   */
  static async sendTrialEndingSoon(
    to: string,
    daysRemaining: number,
    trialEndsAt: string,
  ): Promise<boolean> {
    const subject = `PDF Pro - 您的试用期将在 ${daysRemaining} 天后结束`;

    const formattedEndDate = formatDate(trialEndsAt);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">您的试用期即将结束</h2>
        <p>您的 PDF Pro 试用期将在 <strong>${daysRemaining} 天</strong>后结束。</p>
        <p><strong>结束日期:</strong> ${formattedEndDate}</p>
        <p>为了继续使用所有高级功能，请考虑升级到我们的付费计划。</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard"
             style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            立即升级
          </a>
        </div>
        <p>如有任何问题，请随时联系我们的支持团队。</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  /**
   * 发送订阅即将到期提醒
   * @param to 收件人邮箱
   * @param daysRemaining 剩余天数
   * @param expiresAt 到期日期
   */
  static async sendSubscriptionEndingSoon(
    to: string,
    daysRemaining: number,
    expiresAt: string,
  ): Promise<boolean> {
    const subject = `PDF Pro - 您的订阅将在 ${daysRemaining} 天后到期`;

    const formattedEndDate = formatDate(expiresAt);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">您的订阅即将到期</h2>
        <p>您的 PDF Pro 订阅将在 <strong>${daysRemaining} 天</strong>后到期。</p>
        <p><strong>到期日期:</strong> ${formattedEndDate}</p>
        <p>为了确保您能继续使用所有高级功能，请续订您的订阅。</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard"
             style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            立即续订
          </a>
        </div>
        <p>如果您不希望续订，您的账户将在到期后降级为免费版。</p>
        <p>如有任何问题，请随时联系我们的支持团队。</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  /**
   * 发送订阅已到期通知
   * @param to 收件人邮箱
   */
  static async sendSubscriptionExpired(to: string): Promise<boolean> {
    const subject = 'PDF Pro - 您的订阅已到期';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">您的订阅已到期</h2>
        <p>您的 PDF Pro 订阅已到期。您将无法使用高级功能。</p>
        <p>要恢复对所有功能的访问，请续订您的订阅。</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard"
             style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            立即续订
          </a>
        </div>
        <p>感谢您之前对 PDF Pro 的支持。</p>
        <p>如有任何问题，请随时联系我们的支持团队。</p>
        <p>谢谢!</p>
        <p>PDF Pro 团队</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }
}
