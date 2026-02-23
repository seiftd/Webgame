import Phaser from "phaser";
import MainScene from "../scenes/MainScene";

export default class DungeonManager {
  scene: MainScene;
  walls: Phaser.Physics.Arcade.StaticGroup;
  doors: Phaser.Physics.Arcade.StaticGroup;
  floors: Phaser.GameObjects.Group;

  roomWidth = 20;
  roomHeight = 15;
  tileSize = 64;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.walls = this.scene.physics.add.staticGroup();
    this.doors = this.scene.physics.add.staticGroup();
    this.floors = this.scene.add.group();
  }

  generateRoom(seed: string, roomNumber: number) {
    this.walls.clear(true, true);
    this.doors.clear(true, true);
    this.floors.clear(true, true);

    const width = this.roomWidth * this.tileSize;
    const height = this.roomHeight * this.tileSize;

    this.scene.physics.world.setBounds(0, 0, width, height);

    const isBossRoom = roomNumber % 5 === 0;
    const floorTint = isBossRoom ? 0x551111 : 0xffffff;

    for (let y = 0; y < this.roomHeight; y++) {
      for (let x = 0; x < this.roomWidth; x++) {
        const px = x * this.tileSize + this.tileSize / 2;
        const py = y * this.tileSize + this.tileSize / 2;

        if (
          x === 0 ||
          x === this.roomWidth - 1 ||
          y === 0 ||
          y === this.roomHeight - 1
        ) {
          if (y === 0 && x === Math.floor(this.roomWidth / 2)) {
            this.doors.create(px, py, "door");
          } else {
            this.walls.create(px, py, "wall");
          }
        } else {
          const floor = this.floors.create(px, py, "floor").setDepth(-1);
          floor.setTint(floorTint);
        }
      }
    }
  }

  getSpawnPoint() {
    return {
      x: (this.roomWidth * this.tileSize) / 2,
      y: this.roomHeight * this.tileSize - this.tileSize * 2,
    };
  }
}
