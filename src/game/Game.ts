import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MenuScene from "./scenes/MenuScene";
import MainScene from "./scenes/MainScene";
import UIScene from "./scenes/UIScene";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

export function startGame(containerId: string) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
        gravity: { y: 0, x: 0 },
      },
    },
    scene: [BootScene, MenuScene, MainScene, UIScene],
    plugins: {
      global: [
        {
          key: "rexVirtualJoystick",
          plugin: VirtualJoystickPlugin,
          start: true,
        },
      ],
    },
    pixelArt: true,
    backgroundColor: "#000000",
  };

  return new Phaser.Game(config);
}
