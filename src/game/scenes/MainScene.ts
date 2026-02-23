import Phaser from "phaser";
import Player from "../entities/Player";
import DungeonManager from "../managers/DungeonManager";
import EnemyManager from "../managers/EnemyManager";
import UpgradeManager from "../managers/UpgradeManager";
import SaveSystem from "../managers/SaveSystem";

export default class MainScene extends Phaser.Scene {
  player!: Player;
  dungeonManager!: DungeonManager;
  enemyManager!: EnemyManager;
  upgradeManager!: UpgradeManager;
  seed!: string;
  roomCount: number = 0;
  runTimer: number = 0;

  projectiles!: Phaser.Physics.Arcade.Group;
  enemyProjectiles!: Phaser.Physics.Arcade.Group;
  xpGems!: Phaser.Physics.Arcade.Group;

  playerData: any = null;

  constructor() {
    super("MainScene");
  }

  init(data: any) {
    this.seed = data.seed || Math.random().toString(36).substring(2, 10);
    this.roomCount = data.roomCount || 1;
    this.runTimer = data.runTimer || 0;
    this.playerData = data.playerData || null;
  }

  create() {
    this.dungeonManager = new DungeonManager(this);
    this.enemyManager = new EnemyManager(this);
    this.upgradeManager = new UpgradeManager(this);

    if (this.playerData && this.playerData.activeUpgrades) {
      this.upgradeManager.activeUpgrades = this.playerData.activeUpgrades;
    }

    this.projectiles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });
    this.enemyProjectiles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });
    this.xpGems = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.dungeonManager.generateRoom(this.seed, this.roomCount);

    this.player = new Player(
      this,
      this.dungeonManager.getSpawnPoint().x,
      this.dungeonManager.getSpawnPoint().y,
      this.playerData,
    );

    this.physics.add.collider(this.player, this.dungeonManager.walls);
    this.physics.add.collider(
      this.enemyManager.enemies,
      this.dungeonManager.walls,
    );
    this.physics.add.collider(
      this.enemyManager.enemies,
      this.enemyManager.enemies,
    );

    this.physics.add.overlap(
      this.projectiles,
      this.enemyManager.enemies,
      this.handleProjectileEnemyCollision as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.projectiles,
      this.dungeonManager.walls,
      this.handleProjectileWallCollision as any,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.enemyManager.enemies,
      this.handlePlayerEnemyCollision as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.handlePlayerEnemyProjectileCollision as any,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.xpGems,
      this.handlePlayerXpCollision as any,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.dungeonManager.doors,
      this.handlePlayerDoorCollision as any,
      undefined,
      this,
    );

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    this.scene.launch("UIScene", { mainScene: this });

    this.enemyManager.spawnWave(this.roomCount);
  }

  update(time: number, delta: number) {
    this.runTimer += delta;
    this.player.update(time, delta);
    this.enemyManager.update(time, delta, this.player);
    this.upgradeManager.update(time, delta);
  }

  handleProjectileEnemyCollision(projectile: any, enemy: any) {
    if (projectile.hasHit) return;
    projectile.hasHit = true;

    let damage = this.player.stats.damage;
    let isCrit = false;

    if (Math.random() < this.player.stats.critChance) {
      damage *= 2;
      isCrit = true;
    }

    this.enemyManager.damageEnemy(enemy, damage, isCrit);

    if (
      this.upgradeManager.activeUpgrades.some((u) => u.id === "chain_lightning")
    ) {
      let closestEnemy: any = null;
      let minDistance = 150;

      this.enemyManager.enemies.getChildren().forEach((otherEnemy: any) => {
        if (!otherEnemy.active || otherEnemy === enemy) return;
        const dist = Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          otherEnemy.x,
          otherEnemy.y,
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestEnemy = otherEnemy;
        }
      });

      if (closestEnemy) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          closestEnemy.x,
          closestEnemy.y,
        );
        const proj = this.projectiles.get(enemy.x, enemy.y, "projectile");
        if (proj) {
          proj.setActive(true).setVisible(true);
          proj.setTint(0x00ffff);
          proj.hasHit = false;
          this.physics.velocityFromRotation(angle, 400, proj.body.velocity);

          this.time.delayedCall(1000, () => {
            if (proj.active) proj.destroy();
          });
        }
      }
    }

    projectile.destroy();
  }

  handleProjectileWallCollision(projectile: any, wall: any) {
    projectile.destroy();
  }

  handlePlayerEnemyCollision(player: any, enemy: any) {
    this.player.takeDamage(enemy.damage);
  }

  handlePlayerEnemyProjectileCollision(player: any, projectile: any) {
    projectile.destroy();
    this.player.takeDamage(10);
  }

  handlePlayerXpCollision(player: any, gem: any) {
    gem.destroy();
    this.player.gainXp(10);
  }

  handlePlayerDoorCollision(player: any, door: any) {
    if (this.enemyManager.enemies.countActive(true) === 0) {
      this.nextRoom();
    }
  }

  nextRoom() {
    this.roomCount++;

    const playerData = {
      hp: this.player.hp,
      xp: this.player.xp,
      level: this.player.level,
      nextLevelXp: this.player.nextLevelXp,
      stats: this.player.stats,
      activeUpgrades: this.upgradeManager.activeUpgrades,
    };

    this.scene.restart({
      seed: this.seed,
      roomCount: this.roomCount,
      runTimer: this.runTimer,
      playerData: playerData,
    });
  }

  gameOver() {
    this.scene.pause();
    this.scene.stop("UIScene");

    const meta = SaveSystem.loadMetaStats();
    const currencyGained = this.roomCount * 10 + this.player.level * 5;
    meta.currency += currencyGained;
    SaveSystem.saveMetaStats(meta);

    const width = this.scale.width;
    const height = this.scale.height;

    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      400,
      300,
      0x000000,
      0.8,
    );
    panel.setStrokeStyle(4, 0xff0000);

    this.add
      .text(width / 2, height / 2 - 100, "GAME OVER", {
        fontSize: "48px",
        color: "#ff0000",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Rooms Cleared: ${this.roomCount}`, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 40, `Currency Gained: +${currencyGained}`, {
        fontSize: "24px",
        color: "#ffff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const btn = this.add
      .text(width / 2, height / 2 + 100, "Return to Menu", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
