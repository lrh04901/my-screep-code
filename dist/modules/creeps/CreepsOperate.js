const util = require("../../util/utils");

class CreepsOperate extends util {
  constructor() {
    super();
    this.creeps = Game.creeps;
    this.sources = this.creeps.room.find(FIND_SOURCES);
    this.spawn = Game.spawns["Spawn1"];
  }

  /**
   * 通用模块
   */

  /**
   * 创建一个新的creep
   * @param {Array} body
   * @param {String} name
   * @param {String} role
   */
  createCreeps(body, name, role) {
    this.spawn.spawnCreep(body, name, {
      memory: {
        role: role
      }
    })
  }

  /**
   * 删除死亡的creep
   * @param {Number} interval 扫描间隔
   */
  deleteCreep(interval=3) {
    if (Game.time % 3) {
      return;
    }
    for (let name in Memory.creeps) {
      if (!this.creeps[name]) {
        delete Memory.creeps[name];
        this.printInfo(`删除${name}的内存`, ["Creep死亡"], '#ff0000', false);
        return;
      }
    }
  }

  /**
   * 判断creep类型，并返回所有该类型的creep数组
   * @param {String} role
   * @returns {Array}
   */
  filterCreepType(role) {
    return _.filter(this.creeps, (creep) => creep.memory.role === role);
  }

  /**
   * 获取建筑物或者矿
   * @param creep
   * @param target
   */
  getEnergyFrom(creep, target) {
    let result;
    if (target instanceof Structure) {
      result = creep.withdraw(target, RESOURCE_ENERGY);
    } else {
      result = creep.harvest(target);
    }

    if (result === ERR_NOT_IN_RANGE) {
      creep.moveTo(target.pos);
    }
  }

  /**
   * Harvester操作
   */

  /**
   * harvester移动到指定位置
   * @param creep
   * @param sourceId
   * @returns {boolean}
   */
  beforeHarvest(creep, sourceId) {
    let target;
    const source = Game.getObjectById(sourceId);
    const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    });
    const constructionSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    });

    if (containers.length > 0) {
      target = containers[0];
    } else if (constructionSite.length > 0) {
      target = constructionSite[0];
    } else {
      target = source;
    }

    creep.memory.targetId = target;
    creep.moveTo(target);
    const range = target instanceof Source ? 1 : 0
    if (creep.pos.inRangeTo(target.pos, range)) {
      return true;
    }

    return false;
  }

  onHarvest(creep, sourceId) {
    if (creep.store[RESOURCE_ENERGY] <= 0) {
      this.getEnergyFrom(creep, Game.getObjectById(sourceId));
      return false;
    }

    let target = Game.getObjectById(sourceId);

  }

  stopHarvest() {

  }
}

module.exports = CreepsOperate;
