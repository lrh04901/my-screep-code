const roleHarvester = {
    run(creep){
        if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
            creep.memory.harvesting = false;
        }
        if (!creep.memory.harvesting && creep.store.getFreeCapacity() === creep.store.getCapacity()) {
            creep.memory.harvesting = true;
        }

        const room = Game.spawns.Spawn1.room;
        function handleFixed(object) {
            return new Promise((resolve) => {
                if (object.hits === object.hitsMax) {
                    creep.say("修复完成")
                    resolve(`id为${object.id}的建筑已被修复`);
                }
            })
        }

        async function fixBuilding(targets) {
            for (let obj in targets) {
                if (creep.repair(targets[obj]) === ERR_NOT_IN_RANGE) {
                    creep.say("修复建筑");
                    creep.moveTo(targets[obj], {visualizePathStyle: {stroke: '#060952'}});
                    let res = await handleFixed(targets[obj]);
                    console.log(res)
                }
            }
        }

        if (creep.memory.harvesting) {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#00ccff'}});
                creep.say("获取能量");
            }
        } else {
            if (room.energyAvailable === room.energyCapacityAvailable) {
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax && structure.structureType === STRUCTURE_ROAD
                });

                if (targets.length > 0) {
                    fixBuilding(targets)
                }
            } else {
                let target = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER
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
        }
    }
};

module.exports = roleHarvester;