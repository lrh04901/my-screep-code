const utilsModule = require("utils");
const GUI = require("GuiTools")

const info = {
  showRoomInfo() {
  const utils = new utilsModule();
  let INFO = utils.getUpgradeInfo();
  let component = [
    {
      type: "Div",
      layout: {
        x: 0,
        y: 0,
        width: 10,
        height: 8,
        background: "#b0bec5",
        opacity: 0.5
      },
      child: [
        {
          type: "Text",
          layout: {
            x: 0,
            y: 0,
            content: `当前controller的等级为${INFO.level}`
          }
        },
        {
          type: "Text",
          layout: {
            x: 0,
            y: 1,
            content: `controller升级进度${INFO.progress}/${INFO.TotalProgress}`
          }
        },
        {
          type: "Text",
          layout: {
            x: 0,
            y: 2,
            content: `升级进度:`
          }
        },
        {
          type: "Progress",
          layout: {
            x: 3,
            y: 2,
            background: "#2196f3",
            progressColor: "#4dd0e1",
            width: 6,
            height: 1,
            value: `${Math.floor(INFO.calcPercentage())}`
          }
        }
      ]
    }
  ]
  GUI.draw(new RoomVisual('W31N43'), component)
}
}

module.exports = info
