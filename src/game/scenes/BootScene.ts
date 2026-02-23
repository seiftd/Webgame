import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.generateTextures();
  }

  create() {
    this.scene.start("MenuScene");
  }

  generateTextures() {
    const graphics = this.add.graphics();

    // Player
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("player", 32, 32);
    graphics.clear();

    // Enemy Melee
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("enemy_melee", 32, 32);
    graphics.clear();

    // Enemy Ranged
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("enemy_ranged", 32, 32);
    graphics.clear();

    // Enemy Tank
    graphics.fillStyle(0x880000, 1);
    graphics.fillRect(0, 0, 48, 48);
    graphics.generateTexture("enemy_tank", 48, 48);
    graphics.clear();

    // Enemy Exploder
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture("enemy_exploder", 32, 32);
    graphics.clear();

    // Enemy Summoner
    graphics.fillStyle(0x8800ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("enemy_summoner", 32, 32);
    graphics.clear();

    // Boss
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture("boss", 64, 64);
    graphics.clear();

    // Projectile
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("projectile", 8, 8);
    graphics.clear();

    // Floor tile
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(2, 0x111111, 1);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.generateTexture("floor", 64, 64);
    graphics.clear();

    // Wall tile
    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(2, 0x333333, 1);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.generateTexture("wall", 64, 64);
    graphics.clear();

    // Door tile
    graphics.fillStyle(0x664422, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture("door", 64, 64);
    graphics.clear();

    // XP Gem
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("xp_gem", 8, 8);
    graphics.clear();
  }
}
