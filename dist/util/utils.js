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
}

module.exports = utils;
