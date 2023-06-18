const roleUpgrader = {
    run(creep) {
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
            } else if (containers.length > 1 && containers[0].store[RESOURCE_ENERGY] > 500) {
                if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: "#ff0099"}});
                    creep.say("从container中获取能量");
                }
            } else {
                if(creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1], {visualizePathStyle: {stroke: "#ff0099"}});
                    creep.say("从矿井中获取能量");
                }
            }
        }
    }
};

module.exports = roleUpgrader;
