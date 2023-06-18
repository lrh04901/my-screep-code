class TowerExtension extends StructureTower {
  constructor() {
    super();
    this.towers = Game.rooms['W31N43'].find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER
    });
  }

  /**
   * tower工作主函数
   */
  work() {
    for (let tower of this.towers) {
      let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      let basicStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER)
      });
      let defenseStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)
      });

      if (target !== undefined) {
        this.defenseRoom(tower, target)
      } else {
        if (basicStructure !== undefined) {
          this.fixStructures(tower, basicStructure);
        } else {
          this.fixStructures(tower, defenseStructure);
        }
      }
    }
  }

  /**
   * 攻击进攻的creep
   * @param tower
   * @param target
   */
  defenseRoom(tower, target) {
    tower.attack(target)
  }

  /**
   * 修复建筑物
   * @param tower
   * @param structure
   */
  fixStructures(tower, structure) {
    tower.repair(structure)
  }
}

module.exports = TowerExtension;
