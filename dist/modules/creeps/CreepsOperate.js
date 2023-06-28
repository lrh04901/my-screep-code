const util = require("utils");

class CreepsOperate extends util {
  constructor() {
    super();
    this.creeps = Game.creeps;
    //this.sources = this.creeps.room.find(FIND_SOURCES);
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
    console.log(target)
    creep.moveTo(target);
    const range = target instanceof Source ? 1 : 0
    if (creep.pos.inRangeTo(target.pos, range)) {
      if (creep.store[RESOURCE_ENERGY] <= 0) {
        this.getEnergyFrom(creep, Game.getObjectById(sourceId));
      } else {
        if (range === 1) {
          this.room.createConstructionSite(target.pos, STRUCTURE_CONTAINER);
          //this.beforeHarvest(creep, sourceId);
        }
        if (range === 0) {
          if (target === containers[0]) {
            if (target.hits < target.hitsMax) {
              creep.repair(target);
            }
          } else if(target === constructionSite[0]) {
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
    console.log(this.beforeHarvest(creep, sourceId))
    if (this.beforeHarvest(creep, sourceId)) {
      creep.harvest(Game.getObjectById(sourceId));
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
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#fff"}});
          creep.say("补充建筑能量");
        }
      }
    } else {
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

  handleFixed(creep, object) {
    return new Promise((resolve) => {
      if (object.hits === object.hitsMax) {
        creep.say("修复完成")
        resolve(`id为${object.id}的建筑已被修复`);
      }
    })
  }

  async fixBuilding(creep, targets) {
    for (let obj in targets) {
      if (creep.repair(targets[obj]) === ERR_NOT_IN_RANGE) {
        creep.say("修复建筑");
        creep.moveTo(targets[obj], {visualizePathStyle: {stroke: '#060952'}});
        let res = await this.handleFixed(targets[obj]);
        console.log(res)
      }
    }
  }

  handleRepair(creep) {
    console.log("start")
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.repairing = false;
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() === 0) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      console.log("repair")
      if (this.room.energyAvailable === this.room.energyCapacityAvailable) {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: structure => structure.hits < structure.hitsMax && (structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER)
        });

        if (targets.length > 0) {
          this.fixBuilding(creep, targets)
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
            creep.moveTo(target[0], {visualizePathStyle: {stroke: "#fff"}});
            creep.say("补充能量");
          }
        }
      }
    } else {
      console.log("getEnergy")
      const target = this.room.find(FIND_STRUCTURES, {
        filter: (s) => {
          return s.structureType === STRUCTURE_STORAGE
        }
      });
      console.log(target);
      this.getEnergyFrom(creep, target[0]);
    }
  }
}

module.exports = CreepsOperate;
