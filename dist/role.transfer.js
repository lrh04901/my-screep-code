const roleTransfer = {
  run(creep) {
    function handleFixed(object) {
      return new Promise((resolve) => {
        if (object.progress === object.progressTotal) {
          creep.say("建造完成")
          resolve(`id为${object.id}的建筑已完工`);
        }
      })
    }

    async function fixBuilding(targets) {
      for (let obj in targets) {
        if (creep.build(targets[obj]) === ERR_NOT_IN_RANGE) {
          creep.say("修复建筑");
          creep.moveTo(targets[obj], {visualizePathStyle: {stroke: '#060952'}});
          let res = await handleFixed(targets[obj]);
          console.log(res)
        }
      }
    }

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
          return structure.structureType === STRUCTURE_CONTAINER
        }
      });

      if (targets.length > 0 && targets[0].store.getFreeCapacity() > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#fff"}});
          creep.say("补充container能量");
        }
      } else {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
          fixBuilding(targets)
        }
      }
    }
  }
};

module.exports = roleTransfer;
