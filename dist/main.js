const showRoomInfo = require("InfoBoard")
const towerExtension = require("tower")
const creepsExtension = require("CreepsOperate");


module.exports.loop = () => {
  showRoomInfo.showRoomInfo()
  const roleTower = new towerExtension();
  if (roleTower.towers.length > 0) {
    roleTower.work();
  }

  const roleCreeps = new creepsExtension();

  roleCreeps.deleteCreep(3);

  let harvester = roleCreeps.filterCreepType("harvester");
  let upgrader = roleCreeps.filterCreepType("upgrader");
  let builder = roleCreeps.filterCreepType("builder");
  let transfer = roleCreeps.filterCreepType("transfer");
  let carrier = roleCreeps.filterCreepType("carrier");
  let repairer = roleCreeps.filterCreepType("repairer");
  let controller_level = Game.spawns["Spawn1"].room.controller.level

  if (harvester.length < 2) {
    let newName = "Harvester" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName, 'harvester');
  }

  if (harvester.length >= 1 && repairer.length < 2) {
    let newName = "Repairer" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, 'repairer');
  }

  if (harvester.length >= 1 && repairer.length >= 2 && upgrader.length < 1) {
    let newName = "Upgrader" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, 'upgrader');
  }

  if (controller_level >= 1 && repairer.length >= 2 && harvester.length >= 1 && builder.length < 1) {
    let newName = "Builder" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, 'builder');
  }

  if (harvester.length >= 1 && repairer.length >= 2 && upgrader.length >= 1 && builder.length >= 1 && transfer.length < 1) {
    let newName = "Transfer" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, 'transfer');
  }

  if (harvester.length >= 1 && repairer.length >= 2 && carrier.length < 2) {
    let newName = "Carrier" + Game.time;
    roleCreeps.createCreeps([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, 'carrier');
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
        roleCreeps.onHarvest(harvester[0], "5bbcab3f9099fc012e633296");
        if (harvester.length > 1) {
          roleCreeps.onHarvest(harvester[1], "5bbcab3f9099fc012e633295");
        }
        break;
      case "upgrader":
        roleCreeps.handleUpgrader(creep);
        break;
      case "builder":
        roleCreeps.handlerBuilder(creep);
        break;
      case "transfer":
        roleCreeps.handleTransfer(creep);
        break;
      case "carrier":
        roleCreeps.handleCarrier(creep);
        break;
      case "repairer":
        roleCreeps.handleRepair(creep)
        break;
      default:
        console.log("程序出错");
    }
  }
}