class CreepsOperate {
  constructor() {
    this.creeps = Game.creeps;
    this.sources = this.creeps.room.find(FIND_SOURCES);
    this.spawn = Game.spawns["Spawn1"];
  }

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
   * 删除无用的creep内存
   */
  deleteCreep() {
    for (let name in Memory.creeps) {
      if (!this.creeps[name]) {
        delete Memory.creeps[name];
        console.log("删除无用的creep内存", name);
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

  handleHarvest(creep, source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {

    }
  }
}

module.export = CreepsOperate
