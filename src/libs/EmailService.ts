import { logger } from '@/libs/Logger';
import { AppConfig } from '@/utils/AppConfig';
import { formatLocalizedDate, getEmailTranslations } from '@/utils/EmailTranslations';

/**
 * 邮件服务 - 处理所有与订阅相关的邮件发送
 */
export class EmailService {
  // 防重复发送邮件的缓存（存储最近发送的邮件记录）
  private static recentEmails = new Map<string, number>();
  // 上次发送邮件的时间
  private static lastEmailSentTime = 0;
  // 邮件发送间隔（毫秒）- 确保每秒不超过1个请求
  private static readonly EMAIL_RATE_LIMIT_MS = 1000;

  /**
   * 延迟执行的工具函数
   * @param ms 延迟毫秒数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 控制邮件发送速率，确保不触发限流
   */
  private static async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastEmail = now - this.lastEmailSentTime;

    // 如果距离上次发送不足500毫秒，则等待
    if (timeSinceLastEmail < this.EMAIL_RATE_LIMIT_MS) {
      const waitTime = this.EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;
      logger.info({ waitTime }, '等待邮件发送间隔');
      await this.sleep(waitTime);
    }

    // 更新上次发送时间
    this.lastEmailSentTime = Date.now();
  }

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
      // 控制发送速率
      await this.respectRateLimit();

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

      // 使用指定的发件人地址
      const fromAddress = 'PixelCapture Pro <noreply@winstontech.me>';

      // 记录发送前的配置信息
      logger.info({
        from: fromAddress,
        to,
        subject,
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        customDomain: process.env.EMAIL_DOMAIN || 'send.winstontech.me',
      }, '邮件发送配置');

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        logger.error({
          error,
          message: error.message,
          name: error.name,
          details: error,
        }, '发送邮件失败');
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
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendLicenseEmail(
    to: string,
    licenseKey: string,
    expiresAt: string | null,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    // 防重复发送：检查是否在10分钟内已发送过相同的license邮件
    const emailKey = `license_${to}_${licenseKey}`;
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000; // 10分钟

    // 清理过期的记录
    for (const [key, timestamp] of this.recentEmails.entries()) {
      if (timestamp < tenMinutesAgo) {
        this.recentEmails.delete(key);
      }
    }

    // 检查是否最近已发送过
    if (this.recentEmails.has(emailKey)) {
      logger.info({ to, licenseKey }, '10分钟内已发送过相同的license邮件，跳过发送');
      return true; // 返回true避免上层报错
    }

    try {
      logger.info({ to, licenseKey, expiresAt, locale }, '准备发送许可证邮件');

      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.License?.subject || 'PixelCapture Pro - Your License Key Is Ready';
      const greeting = messages?.Emails?.License?.greeting || 'Thank you for purchasing PixelCapture Pro!';
      const importantNoteTitle = messages?.Emails?.License?.important_note_title || 'Important: Activation Required';
      const importantNoteContent = messages?.Emails?.License?.important_note_content
        || 'You need to log in and activate your account with the license key below to use Pro features.';
      const keyIntro = messages?.Emails?.License?.key_intro || 'Your license key is:';
      const activationStepsTitle = messages?.Emails?.License?.activation_steps_title || 'Activation Steps:';
      const activationStep1 = messages?.Emails?.License?.activation_step1 || 'Log in to your PixelCapture Pro account';
      const activationStep2 = messages?.Emails?.License?.activation_step2 || 'Visit the dashboard page';
      const activationStep3 = messages?.Emails?.License?.activation_step3 || 'Enter the key above in the "License Activation" section';
      const activationStep4 = messages?.Emails?.License?.activation_step4 || 'Click the "Activate" button';
      const goToActivation = messages?.Emails?.License?.go_to_activation || 'Go to Activation Page';
      const contactSupport = messages?.Emails?.Common?.contact_support || 'If you have any questions, please contact our support team.';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>

          <div style="background-color: #f9f5ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #7c3aed;">${importantNoteTitle}</p>
            <p style="margin: 8px 0 0 0;">${importantNoteContent}</p>
          </div>

          <p>${keyIntro}</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-family: monospace; margin: 20px 0;">
            ${licenseKey}
          </div>

          <h3 style="color: #4f46e5; margin-top: 30px;">${activationStepsTitle}</h3>
          <ol style="line-height: 1.6;">
            <li>${activationStep1}</li>
            <li>${activationStep2}</li>
            <li>${activationStep3}</li>
            <li>${activationStep4}</li>
          </ol>

          <div style="margin: 25px 0; text-align: center;">
            <a href="https://pixelcapture.winstontech.me/dashboard"
               style="background-color: #4f46e5; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      display: inline-block;">
              ${goToActivation}
            </a>
          </div>

          <p>${contactSupport}</p>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      const result = await this.sendEmail(to, subject, htmlContent);

      // 如果发送成功，记录到缓存中
      if (result) {
        this.recentEmails.set(emailKey, now);
        logger.info({ to, licenseKey, locale }, 'License邮件发送成功，已记录到防重复缓存');
      }

      return result;
    } catch (error) {
      logger.error({ error, to, licenseKey, locale }, 'License邮件发送失败');
      return false;
    }
  }

  /**
   * 发送订阅确认邮件
   * @param to 收件人邮箱
   * @param planName 计划名称
   * @param expiresAt 过期日期
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendSubscriptionConfirmation(
    to: string,
    planName: string,
    expiresAt: string | null,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.SubscriptionConfirmation?.subject || 'PixelCapture Pro - Your Subscription Is Confirmed';
      const greeting = messages?.Emails?.SubscriptionConfirmation?.greeting || 'Your subscription has been successfully activated!';
      const content = messages?.Emails?.SubscriptionConfirmation?.content
        || 'Thank you for subscribing to PixelCapture Pro. You now have access to all premium features.';
      const planLabel = messages?.Emails?.SubscriptionConfirmation?.subscription_plan || 'Subscription plan:';
      const expiryDateLabel = messages?.Emails?.SubscriptionConfirmation?.expiry_date || 'Expiration date:';
      const dashboardInfo = messages?.Emails?.SubscriptionConfirmation?.dashboard_info
        || 'You can view your subscription details in the dashboard at any time.';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';
      const permanentLicense = messages?.Emails?.Common?.permanent_license || 'Permanent (never expires)';

      // 格式化过期日期，使用用户语言偏好
      const formattedExpiryDate = expiresAt ? formatLocalizedDate(expiresAt, locale) : permanentLicense;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>
          <p>${content}</p>
          <p><strong>${planLabel}</strong> ${planName}</p>
          <p><strong>${expiryDateLabel}</strong> ${formattedExpiryDate}</p>
          <p>${dashboardInfo}</p>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      return this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      logger.error({ error, to, planName, locale }, '订阅确认邮件发送失败');
      return false;
    }
  }

  /**
   * 发送试用期开始邮件
   * @param to 收件人邮箱
   * @param trialEndsAt 试用期结束日期
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendTrialStarted(
    to: string,
    trialEndsAt: string,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.TrialStarted?.subject || 'PixelCapture Pro - Your Trial Has Started';
      const greeting = messages?.Emails?.TrialStarted?.greeting || 'Your PixelCapture Pro trial has begun!';
      const content = messages?.Emails?.TrialStarted?.content
        || 'Thank you for starting your PixelCapture Pro trial. You now have access to all premium features.';
      const trialEndsLabel = messages?.Emails?.TrialStarted?.trial_ends || 'Trial end date:';
      const afterTrial = messages?.Emails?.TrialStarted?.after_trial
        || 'After the trial ends, you can purchase a subscription to continue using all features.';
      const contactSupport = messages?.Emails?.Common?.contact_support
        || 'If you have any questions, please contact our support team.';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';

      // 格式化结束日期
      const formattedEndDate = formatLocalizedDate(trialEndsAt, locale);

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>
          <p>${content}</p>
          <p><strong>${trialEndsLabel}</strong> ${formattedEndDate}</p>
          <p>${afterTrial}</p>
          <p>${contactSupport}</p>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      return this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      logger.error({ error, to, trialEndsAt, locale }, '试用开始邮件发送失败');
      return false;
    }
  }

  /**
   * 发送试用期即将结束提醒
   * @param to 收件人邮箱
   * @param daysRemaining 剩余天数
   * @param trialEndsAt 试用期结束日期
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendTrialEndingSoon(
    to: string,
    daysRemaining: number,
    trialEndsAt: string,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.TrialEndingSoon?.subject?.replace('{days}', daysRemaining.toString())
        || `PixelCapture Pro - Your Trial Is Ending Soon (${daysRemaining} days left)`;
      const greeting = messages?.Emails?.TrialEndingSoon?.greeting || 'Your trial period is ending soon';
      const content = messages?.Emails?.TrialEndingSoon?.content?.replace('{days}', daysRemaining.toString())
        || `Your PixelCapture Pro trial will end in ${daysRemaining} days.`;
      const endDateLabel = messages?.Emails?.TrialEndingSoon?.end_date || 'End date:';
      const upgradeMessage = messages?.Emails?.TrialEndingSoon?.upgrade_message
        || 'To continue using all premium features, please consider upgrading to our paid plan.';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';

      // 格式化结束日期
      const formattedEndDate = formatLocalizedDate(trialEndsAt, locale);

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>
          <p>${content}</p>
          <p><strong>${endDateLabel}</strong> ${formattedEndDate}</p>
          <p>${upgradeMessage}</p>
          <div style="margin: 20px 0;">
            <a href="https://pixelcapture.winstontech.me/dashboard"
               style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              立即升级
            </a>
          </div>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      return this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      logger.error({ error, to, daysRemaining, trialEndsAt, locale }, '试用结束提醒邮件发送失败');
      return false;
    }
  }

  /**
   * 发送订阅即将到期提醒
   * @param to 收件人邮箱
   * @param daysRemaining 剩余天数
   * @param expiresAt 订阅到期日期
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendSubscriptionEndingSoon(
    to: string,
    daysRemaining: number,
    expiresAt: string,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.SubscriptionEndingSoon?.subject || 'PixelCapture Pro - Your Subscription Is Ending Soon';
      const greeting = messages?.Emails?.SubscriptionEndingSoon?.greeting || 'Your subscription is ending soon';
      const content = messages?.Emails?.SubscriptionEndingSoon?.content?.replace('{days}', daysRemaining.toString())
        || `Your PixelCapture Pro subscription will expire in ${daysRemaining} days.`;
      const expiryDateLabel = messages?.Emails?.SubscriptionEndingSoon?.expiry_date || 'Expiration date:';
      const renewalMessage = messages?.Emails?.SubscriptionEndingSoon?.renewal_message
        || 'To continue using all premium features, please renew your subscription.';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';

      // 格式化过期日期
      const formattedExpiryDate = formatLocalizedDate(expiresAt, locale);

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>
          <p>${content}</p>
          <p><strong>${expiryDateLabel}</strong> ${formattedExpiryDate}</p>
          <p>${renewalMessage}</p>
          <div style="margin: 20px 0;">
            <a href="https://pixelcapture.winstontech.me/dashboard"
               style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               立即续订
            </a>
          </div>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      return this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      logger.error({ error, to, daysRemaining, expiresAt, locale }, '订阅即将过期邮件发送失败');
      return false;
    }
  }

  /**
   * 发送订阅已过期邮件
   * @param to 收件人邮箱
   * @param locale 用户语言偏好，默认为英语
   */
  static async sendSubscriptionExpired(
    to: string,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 获取国际化翻译
      const messages = await getEmailTranslations(locale);

      // 获取翻译文本
      const subject = messages?.Emails?.SubscriptionExpired?.subject || 'PixelCapture Pro - Your Subscription Has Expired';
      const greeting = messages?.Emails?.SubscriptionExpired?.greeting || 'Your subscription has expired';
      const content = messages?.Emails?.SubscriptionExpired?.content
        || 'Your PixelCapture Pro subscription has expired. You no longer have access to premium features.';
      const renewMessage = messages?.Emails?.SubscriptionExpired?.renew_message
        || 'To restore access to all premium features, please renew your subscription.';
      const renewButton = messages?.Emails?.SubscriptionExpired?.renew_button || 'Renew Now';
      const thankYou = messages?.Emails?.Common?.thank_you || 'Thank you!';
      const teamSignature = messages?.Emails?.Common?.team_signature || 'PixelCapture Pro Team';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${greeting}</h2>
          <p>${content}</p>
          <p>${renewMessage}</p>
          <div style="margin: 20px 0;">
            <a href="https://pixelcapture.winstontech.me/dashboard"
               style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              ${renewButton}
            </a>
          </div>
          <p>${thankYou}</p>
          <p>${teamSignature}</p>
        </div>
      `;

      return this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      logger.error({ error, to, locale }, '订阅过期邮件发送失败');
      return false;
    }
  }
}
