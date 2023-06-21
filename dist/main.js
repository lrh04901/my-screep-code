const showRoomInfo = require("InfoBoard")
const roleHarvester = require("role.harvester");
const roleUpgrader = require("role.upgrader");
const roleBuilder = require("role.builder");
const roleTransfer = require("role.transfer");
const roleCarrier = require("role.carrier");
const towerExtension = require("tower")


module.exports.loop = () => {
  showRoomInfo.showRoomInfo()
  const roleTower = new towerExtension();
  if (roleTower.towers.length > 0) {
    roleTower.work();
  }

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("删除无用的creep内存", name);
    }
  }

  let harvester = _.filter(Game.creeps, (creep) => creep.memory.role === "harvester");
  let upgrader = _.filter(Game.creeps, (creep) => creep.memory.role === "upgrader");
  let builder = _.filter(Game.creeps, (creep) => creep.memory.role === "builder");
  let transfer = _.filter(Game.creeps, (creep) => creep.memory.role === "transfer");
  let carrier = _.filter(Game.creeps, (creep) => creep.memory.role === "carrier");
  let controller_level = Game.spawns["Spawn1"].room.controller.level

  if (harvester.length < 3) {
    let newName = "Harvester" + Game.time;
    Game.spawns["Spawn1"].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE], newName, {
      memory: {
        role: 'harvester'
      }
    });
  }

  if (harvester.length >= 3 && upgrader.length < 2) {
    let newName = "Upgrader" + Game.time;
    Game.spawns["Spawn1"].spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {
      memory: {
        role: 'upgrader'
      }
    });
  }

  if (controller_level >= 2 && harvester.length >= 3 && builder.length < 2) {
    let newName = "Builder" + Game.time;
    Game.spawns["Spawn1"].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
      memory: {
        role: 'builder'
      }
    });
  }

  if (harvester.length >= 3 && upgrader.length >= 2 && builder.length >= 2 && transfer.length < 1) {
    let newName = "Transfer" + Game.time;
    Game.spawns["Spawn1"].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
      memory: {
        role: 'transfer'
      }
    });
  }

  if (harvester.length >= 3 && upgrader.length >= 2 && builder.length >= 2 && carrier.length < 1) {
    let newName = "Carrier" + Game.time;
    Game.spawns["Spawn1"].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {
      memory: {
        role: 'carrier'
      }
    });
  }

  if (Game.spawns["Spawn1"].spawning) {
    let spawningCreep = Game.creeps[Game.spawns["Spawn1"].spawning.name];
    Game.spawns["Spawn1"].room.visual.text("建造中" + spawningCreep.memory.role, Game.spawns["Spawn1"].pos.x + 1, Game.spawns["Spawn1"].pos.y, {
      align: "left",
      opacity: 0.8
    });
  }

  for (let name in Game.creeps) {
    const creep = Game.creeps[name];
    switch (creep.memory.role) {
      case "harvester":
        roleHarvester.run(creep);
        break;
      case "upgrader":
        roleUpgrader.run(creep);
        break;
      case "builder":
        roleBuilder.run(creep);
        break;
      case "transfer":
        roleTransfer.run(creep);
        break;
      case "carrier":
        roleCarrier.run(creep);
        break;
      default:
        console.log("程序出错");
    }
  }
}
