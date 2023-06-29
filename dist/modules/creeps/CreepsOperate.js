const util = require("utils");

class CreepsOperate extends util {
  constructor() {
    super();
    this.creeps = Game.creeps;
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
  deleteCreep(interval = 3) {
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
      creep.moveTo(target.pos, {visualizePathStyle: {stroke: "#00ff81"}});
    }
  }

  /**
   * <=============================================Harvester操作====================================================>
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
    creep.moveTo(target, {visualizePathStyle: {stroke: "#c941a3"}});
    const range = target instanceof Source ? 1 : 0
    if (creep.pos.inRangeTo(target.pos, range)) {
      if (creep.store[RESOURCE_ENERGY] <= 0) {
        this.getEnergyFrom(creep, Game.getObjectById(sourceId));
      } else {
        if (range === 1) {
          this.room.createConstructionSite(target.pos, STRUCTURE_CONTAINER);
        }
        if (range === 0) {
          if (target === containers[0]) {
            if (target.hits < target.hitsMax) {
              creep.repair(target);
            }
          } else if (target === constructionSite[0]) {
            creep.build(target);
          }
        }
      }
      return true;
    }

    return false;
  }

  /**
   * 采集能量
   * @param creep
   * @param sourceId
   */
  onHarvest(creep, sourceId) {
    if (this.beforeHarvest(creep, sourceId)) {
      creep.harvest(Game.getObjectById(sourceId));
      if (creep.ticksToLive <= 3) {
        creep.drop(RESOURCE_ENERGY);
      }
    }
  }

  /**
   * <=============================================carrier操作====================================================>
   */


  /**
   * Carrier将container中的能量转移至storage中
   * @param creep
   */
  handleCarrier(creep) {
    if (creep.memory.carriered && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.carriered = false;
    }
    if (!creep.memory.carriered && creep.store.getFreeCapacity() === 0) {
      creep.memory.carriered = true;
    }

    if (creep.memory.carriered) {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_STORAGE
        }
      });

      if (targets.length > 0 && targets[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#ff0000"}});
          creep.say("补充建筑能量");
        }
      }
    } else {
      const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES)
      if (droppedEnergy.length > 0) {
        let target = creep.pos.findClosestByPath(droppedEnergy);
        creep.moveTo(target, {visualizePathStyle: {stroke: "#ff0099"}});
        creep.pickup(target);
        creep.say("从掉落能量中获取能量");
      }
      let containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
        }
      });
      let target = creep.pos.findClosestByPath(containers)
      if (target !== null) {
        this.getEnergyFrom(creep, target);
      } else {
        return;
      }
    }
  }

  /**
   * <=============================================repairer操作====================================================>
   */

  /**
   * 修复完成回调
   * @param creep
   * @param object
   * @returns {Promise<unknown>}
   */
  handleFixed(creep, object) {
    return new Promise((resolve) => {
      if (object.hits === object.hitsMax) {
        creep.say("修复完成")
        resolve(`id为${object.id}的建筑已被修复`);
      }
    })
  }

  /**
   * 修复建筑函数
   * @param creep
   * @param targets
   * @returns {Promise<void>}
   */
  async fixBuilding(creep, targets) {
    for (let obj in targets) {
      if (creep.repair(targets[obj]) === ERR_NOT_IN_RANGE) {
        creep.say("修复建筑");
        creep.moveTo(targets[obj], {visualizePathStyle: {stroke: '#060952'}});
        let res = await this.handleFixed(creep, targets[obj]);
        this.printInfo(res, "Building", '#9a9eff', false);
      }
    }
  }

  /**
   * repairer操作主函数
   * @param creep
   */
  handleRepair(creep) {
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.repairing = false;
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() === 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      if (this.room.energyAvailable === this.room.energyCapacityAvailable) {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: structure => structure.hits < structure.hitsMax && (structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER)
        });

        if (targets.length > 0) {
          this.fixBuilding(creep, targets)
        } else {
          if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#cc2424"}});
            creep.say("帮助升级")
          }
        }
      } else {
        let target = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (
                structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN
            ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          }
        });
        if (target.length > 0) {
          if (creep.transfer(target[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target[0], {visualizePathStyle: {stroke: "#00ff81"}});
            creep.say("补充能量");
          }
        }
      }
    } else {
      const target = this.room.find(FIND_STRUCTURES, {
        filter: (s) => {
          return s.structureType === STRUCTURE_STORAGE
        }
      });
      this.getEnergyFrom(creep, target[0]);
    }
  }

  /**
   * <=============================================upgrader操作====================================================>
   */

  /**
   * Upgrader运行主函数
   * @param creep
   */
  handleUpgrader(creep) {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say("升级")
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#cc2424"}});
      }
    } else {
      const storages = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_STORAGE
        }
      });
      if (storages.length > 0 && storages[0].store[RESOURCE_ENERGY] > 500) {
        this.getEnergyFrom(creep, storages[0]);
        creep.say("从storage中获取能量");
      }
    }
  }

  /**
   * <==============================================transfer操作=======================================================>
   */

  /**
   * Transfer运行主函数
   * @param creep
   */
  handleTransfer(creep) {
    if (creep.memory.transferring && creep.store.getFreeCapacity() === 0) {
      creep.memory.transferring = false;
    }
    if (!creep.memory.transferring && creep.store.getFreeCapacity() === creep.store.getCapacity()) {
      creep.memory.transferring = true;
    }

    if (creep.memory.transferring) {
      const storages = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_STORAGE
        }
      });
      if (storages.length > 0 && storages[0].store[RESOURCE_ENERGY] > 500) {
        this.getEnergyFrom(creep, storages[0])
        creep.say("获取能量");
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_TOWER
        }
      });

      if (targets.length > 0 && (targets[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0 || targets[1].store.getFreeCapacity(RESOURCE_ENERGY) > 0)) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE && targets[1].store[RESOURCE_ENERGY] > 500) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#fff"}});
          creep.say("补充建筑能量");
        } else {
          if (creep.transfer(targets[1], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[1], {visualizePathStyle: {stroke: "#fff"}});
          }
          creep.say("补充建筑能量");
        }
      }
    }
  }

  /**
   * <==============================================builder操作=======================================================>
   */

  /**
   * builder执行主函数
   * @param creep
   */
  handlerBuilder(creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#fff'}});
        }
      } else {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#cc2424"}});
          creep.say("帮助升级")
        }
      }
    } else {
      const storages = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_STORAGE
        }
      });
      if (storages.length > 0 && storages[0].store[RESOURCE_ENERGY] > 500) {
        this.getEnergyFrom(creep, storages[0])
        creep.say("获取能量");
      }
    }
  }
}

module.exports = CreepsOperate;
