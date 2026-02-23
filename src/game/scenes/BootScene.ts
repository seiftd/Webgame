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

    // --- Player (Knight) ---
    graphics.clear();
    // Body
    graphics.fillStyle(0xaaaaaa, 1); // Silver armor
    graphics.fillRect(8, 12, 16, 14);
    // Head (Helmet)
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(10, 4, 12, 10);
    // Visor
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(12, 8, 8, 2);
    // Sword
    graphics.fillStyle(0xeeeeee, 1); // Blade
    graphics.fillRect(24, 8, 4, 16);
    graphics.fillStyle(0x8b4513, 1); // Hilt
    graphics.fillRect(23, 22, 6, 2);
    graphics.fillRect(25, 24, 2, 4);
    graphics.generateTexture("player", 32, 32);

    // --- Enemy Melee (Orc/Goblin) ---
    graphics.clear();
    // Body
    graphics.fillStyle(0x2e8b57, 1); // SeaGreen
    graphics.fillRect(8, 10, 16, 16);
    // Head
    graphics.fillStyle(0x3cb371, 1);
    graphics.fillRect(8, 2, 16, 10);
    // Eyes
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(10, 6, 4, 2);
    graphics.fillRect(18, 6, 4, 2);
    // Club
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(24, 4, 6, 16);
    graphics.generateTexture("enemy_melee", 32, 32);

    // --- Enemy Ranged (Skeleton Archer) ---
    graphics.clear();
    // Body (Robes/Bones)
    graphics.fillStyle(0xdddddd, 1);
    graphics.fillRect(10, 10, 12, 16);
    // Head (Skull)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(10, 2, 12, 10);
    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(12, 6, 2, 2);
    graphics.fillRect(18, 6, 2, 2);
    // Bow
    graphics.lineStyle(2, 0x8b4513, 1);
    graphics.beginPath();
    graphics.moveTo(4, 4);
    // Phaser Graphics doesn't have quadraticBezierTo directly exposed in all versions in the same way, 
    // but we can use a simple approximation or just lines for the bow shape.
    // Actually, Phaser.GameObjects.Graphics does not have quadraticBezierTo. 
    // We should use slice or arc or just lines.
    graphics.lineTo(0, 16);
    graphics.lineTo(4, 28);
    graphics.strokePath();
    graphics.lineStyle(1, 0xeeeeee, 0.5);
    graphics.lineBetween(4, 4, 4, 28);
    graphics.generateTexture("enemy_ranged", 32, 32);

    // --- Enemy Tank (Ogre) ---
    graphics.clear();
    // Body
    graphics.fillStyle(0x556b2f, 1); // DarkOliveGreen
    graphics.fillRect(4, 12, 40, 30);
    // Head
    graphics.fillStyle(0x6b8e23, 1);
    graphics.fillRect(14, 2, 20, 14);
    // Armor Plate
    graphics.fillStyle(0x2f4f4f, 1);
    graphics.fillRect(10, 18, 28, 18);
    // Eyes
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(18, 8, 4, 2);
    graphics.fillRect(26, 8, 4, 2);
    graphics.generateTexture("enemy_tank", 48, 48);

    // --- Enemy Exploder (Bomb/Slime) ---
    graphics.clear();
    // Main body
    graphics.fillStyle(0xff4500, 1); // OrangeRed
    graphics.fillCircle(16, 16, 14);
    // Shine
    graphics.fillStyle(0xffd700, 0.8);
    graphics.fillCircle(12, 12, 4);
    // Fuse
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(15, 0, 2, 4);
    // Spark
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 0, 2);
    graphics.generateTexture("enemy_exploder", 32, 32);

    // --- Enemy Summoner (Dark Wizard) ---
    graphics.clear();
    // Robe
    graphics.fillStyle(0x4b0082, 1); // Indigo
    graphics.fillRect(8, 8, 16, 24);
    // Hood
    graphics.fillStyle(0x800080, 1);
    graphics.fillRect(8, 2, 16, 10);
    // Staff
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(26, 4, 2, 28);
    // Orb on staff
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(27, 4, 3);
    graphics.generateTexture("enemy_summoner", 32, 32);

    // --- Boss (Demon King) ---
    graphics.clear();
    // Body
    graphics.fillStyle(0x8b0000, 1); // DarkRed
    graphics.fillRect(12, 20, 40, 40);
    // Head
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(20, 4, 24, 20);
    // Horns
    graphics.fillStyle(0xeeeeee, 1);
    graphics.beginPath();
    graphics.moveTo(20, 4);
    graphics.lineTo(12, -4);
    graphics.lineTo(22, 8);
    graphics.fillPath();
    graphics.beginPath();
    graphics.moveTo(44, 4);
    graphics.lineTo(52, -4);
    graphics.lineTo(42, 8);
    graphics.fillPath();
    // Eyes
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(24, 12, 6, 4);
    graphics.fillRect(34, 12, 6, 4);
    graphics.generateTexture("boss", 64, 64);

    // --- Projectile ---
    graphics.clear();
    graphics.fillStyle(0x00ffff, 1); // Cyan energy
    graphics.fillCircle(4, 4, 4);
    graphics.fillStyle(0xffffff, 0.8); // Core
    graphics.fillCircle(4, 4, 2);
    graphics.generateTexture("projectile", 8, 8);

    // --- Floor tile (Stone Bricks) ---
    graphics.clear();
    graphics.fillStyle(0x2a2a2a, 1); // Dark base
    graphics.fillRect(0, 0, 64, 64);
    // Bricks
    graphics.lineStyle(2, 0x1a1a1a, 1);
    graphics.strokeRect(2, 2, 28, 28);
    graphics.strokeRect(34, 2, 28, 28);
    graphics.strokeRect(2, 34, 28, 28);
    graphics.strokeRect(34, 34, 28, 28);
    // Cracks
    graphics.lineStyle(1, 0x111111, 0.5);
    graphics.beginPath();
    graphics.moveTo(10, 10);
    graphics.lineTo(15, 15);
    graphics.strokePath();
    graphics.generateTexture("floor", 64, 64);

    // --- Wall tile (Stone Block) ---
    graphics.clear();
    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(0, 0, 64, 64);
    // Bevel
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(0, 0, 64, 4);
    graphics.fillRect(0, 0, 4, 64);
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 60, 64, 4);
    graphics.fillRect(60, 0, 4, 64);
    // Texture
    graphics.fillStyle(0x3a3a3a, 1);
    graphics.fillRect(10, 10, 10, 10);
    graphics.fillRect(40, 30, 15, 5);
    graphics.generateTexture("wall", 64, 64);

    // --- Door tile ---
    graphics.clear();
    graphics.fillStyle(0x4a3c31, 1); // Wood
    graphics.fillRect(0, 0, 64, 64);
    // Planks
    graphics.lineStyle(2, 0x2a1c11, 1);
    graphics.lineBetween(16, 0, 16, 64);
    graphics.lineBetween(32, 0, 32, 64);
    graphics.lineBetween(48, 0, 48, 64);
    // Frame
    graphics.lineStyle(4, 0x666666, 1);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.generateTexture("door", 64, 64);

    // --- XP Gem ---
    graphics.clear();
    graphics.fillStyle(0x00ff00, 1); // Green
    graphics.beginPath();
    graphics.moveTo(4, 0);
    graphics.lineTo(8, 4);
    graphics.lineTo(4, 8);
    graphics.lineTo(0, 4);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture("xp_gem", 8, 8);
  }
}
