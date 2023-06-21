const roleUpgrader = {
  run(creep) {
    if (creep.memory.carriered && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.carriered = false;
    }
    if (!creep.memory.carriered && creep.store.getFreeCapacity() === 0) {
      creep.memory.carriered = true;
      creep.say("采集完成")
    }

    if (creep.memory.carriered) {
      const targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
              return structure.structureType === STRUCTURE_TOWER
          }
      });

      if (targets.length > 0 && targets[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#fff"}});
              creep.say("补充建筑能量");
          }
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      const targets = creep.room.find(FIND_DROPPED_RESOURCES)
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_CONTAINER
        }
      });
      if (targets.length > 0) {
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#ff0099"}});
        creep.pickup(targets[0]);
        creep.say("从掉落能量中获取能量");
      } else if (containers.length > 0 && containers[0].store[RESOURCE_ENERGY] > 500) {
        if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(containers[0], {visualizePathStyle: {stroke: "#ff0099"}});
          creep.say("从container中获取能量");
        }
      } else {
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {visualizePathStyle: {stroke: "#ff0099"}});
          creep.say("从矿井中获取能量");
        }
      }
    }
  }
};

module.exports = roleUpgrader;
