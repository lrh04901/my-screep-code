class utils {
  constructor() {
    this.room = Game.rooms['W31N43']
  }

  /**
   * 返回controller基本信息
   * @returns {{calcPercentage(): string, safeModeCooldown: number, level: number, TotalProgress: number, progress: number, safeModeAvailable: number}|string}
   */
  getUpgradeInfo() {
    const controller = this.room.controller
    return {
      level: controller.level,
      progress: controller.progress,
      TotalProgress: controller.progressTotal,
      safeModeAvailable: controller.safeModeAvailable,
      safeModeCooldown: controller.safeModeCooldown,
      calcPercentage() {
        return (this.progress / this.TotalProgress) * 100
      }
    }
  }

  /**
   * 设置调试字体样式
   * @param content
   * @param color
   * @param isBolder
   * @returns {string}
   */
  setColor(content, color, isBolder=false) {
    return `<text style="color: ${color};font-weight: ${isBolder ? 'bolder' : 'normal'};">${content}</text>`
  }

  /**
   * 自定义控制台调试信息
   * @param content
   * @param log_types
   * @param color
   * @param isNotify
   */
  printInfo(content, log_types, color, isNotify) {
    let type = log_types.length > 0 ? `「${log_types.join('')}」` : "";
    type = this.setColor(type, color, true);

    const logMessage = `${type}${content}`;
    console.log(logMessage);
    if (isNotify) {
      Game.notify(logMessage);
    }
  }
}

module.exports = utils;
