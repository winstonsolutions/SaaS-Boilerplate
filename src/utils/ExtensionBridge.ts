// 扩展通信工具类
type UserStatus = {
  isLoggedIn: boolean;
  isPro: boolean;
  isInTrial: boolean;
};

export class ExtensionBridge {
  // 发送用户状态到扩展
  static sendUserStatus(status: UserStatus): void {
    window.postMessage({
      type: 'PIXEL_CAPTURE_USER_STATUS',
      status,
      source: 'pixel-capture-website',
      timestamp: Date.now(),
    }, '*');
  }

  // 登录成功时调用
  static notifyLogin(isPro: boolean, isInTrial: boolean): void {
    this.sendUserStatus({
      isLoggedIn: true,
      isPro,
      isInTrial,
    });
  }

  // 登出时调用
  static notifyLogout(): void {
    this.sendUserStatus({
      isLoggedIn: false,
      isPro: false,
      isInTrial: false,
    });
  }

  // 检查扩展是否可用（可选）
  static checkExtensionAvailable(): void {
    window.postMessage({
      type: 'PIXEL_CAPTURE_PING',
      source: 'pixel-capture-website',
    }, '*');
  }
}
