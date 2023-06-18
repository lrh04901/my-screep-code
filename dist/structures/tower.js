class TowerExtension extends StructureTower {
  work() {
    if (this.store[RESOURCE_ENERGY] < 10) return this.requireEnergy();

    switch (this.room.memory.defenseMode) {
      case 'defense':
        this.defenseWork();
        break;
      case 'active':
        this.activeWork();
        break;
      default:
        this.dailyWork();
        break;
    }
  }

  requireEnergy() {

  }

  dailyWork() {

  }

  defenseWork() {

  }

  activeWork() {

  }
}