const roleTransfer = {
  run(creep) {
    if (creep.memory.transferring && creep.store.getFreeCapacity() === 0) {
      creep.memory.transferring = false;
    }
    if (!creep.memory.transferring && creep.store.getFreeCapacity() === creep.store.getCapacity()) {
      creep.memory.transferring = true;
    }

    if (creep.memory.transferring) {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: "#ff0099"}});
      }
    } else {
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
    }
  }
};

module.exports = roleTransfer;
