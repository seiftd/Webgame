import Phaser from "phaser";
import MainScene from "../scenes/MainScene";
import SaveSystem from "../managers/SaveSystem";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  scene: MainScene;
  keys: any;

  hp: number;
  xp: number = 0;
  level: number = 1;
  nextLevelXp: number = 100;

  stats = {
    maxHp: 100,
    speed: 200,
    damage: 25,
    attackSpeed: 500,
    critChance: 0.05,
  };

  lastAttackTime: number = 0;
  isInvincible: boolean = false;
  dashCooldown: number = 0;
  isDashing: boolean = false;

  constructor(scene: MainScene, x: number, y: number, playerData: any = null) {
    super(scene, x, y, "player");
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(24, 24);

    if (playerData) {
      this.hp = playerData.hp;
      this.xp = playerData.xp;
      this.level = playerData.level;
      this.nextLevelXp = playerData.nextLevelXp;
      this.stats = { ...playerData.stats };
    } else {
      const meta = SaveSystem.loadMetaStats();
      this.stats.damage += meta.damageBoost;
      this.stats.maxHp += meta.hpBoost;
      this.stats.speed += meta.speedBoost;
      this.hp = this.stats.maxHp;
    }

    this.keys = this.scene.input.keyboard!.addKeys("W,A,S,D,SPACE");
  }

  update(time: number, delta: number) {
    if (this.isDashing) return;

    let vx = 0;
    let vy = 0;

    if (this.keys.A.isDown) vx = -1;
    if (this.keys.D.isDown) vx = 1;
    if (this.keys.W.isDown) vy = -1;
    if (this.keys.S.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }

    this.setVelocity(vx * this.stats.speed, vy * this.stats.speed);

    if (this.dashCooldown > 0) this.dashCooldown -= delta;
    if (
      this.keys.SPACE.isDown &&
      this.dashCooldown <= 0 &&
      (vx !== 0 || vy !== 0)
    ) {
      this.dash(vx, vy);
    }

    if (time - this.lastAttackTime > this.stats.attackSpeed) {
      this.autoAttack();
      this.lastAttackTime = time;
    }
  }

  dash(vx: number, vy: number) {
    this.isDashing = true;
    this.dashCooldown = 2000;
    this.isInvincible = true;

    this.setVelocity(vx * this.stats.speed * 3, vy * this.stats.speed * 3);

    this.scene.time.delayedCall(200, () => {
      this.isDashing = false;
      this.isInvincible = false;
    });
  }

  autoAttack() {
    let closestEnemy: any = null;
    let minDistance = 300;

    this.scene.enemyManager.enemies.getChildren().forEach((enemy: any) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y,
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        closestEnemy.x,
        closestEnemy.y,
      );

      const fireProjectile = (startAngle: number) => {
        const proj = this.scene.projectiles.get(this.x, this.y, "projectile");
        if (proj) {
          proj.setActive(true).setVisible(true);
          proj.hasHit = false;
          proj.setTint(0xffff00);
          this.scene.physics.velocityFromRotation(
            startAngle,
            400,
            proj.body.velocity,
          );

          this.scene.time.delayedCall(2000, () => {
            if (proj.active) proj.destroy();
          });
        }
      };

      fireProjectile(angle);

      if (
        this.scene.upgradeManager.activeUpgrades.some(
          (u) => u.id === "shadow_clone",
        )
      ) {
        fireProjectile(angle - 0.2);
        fireProjectile(angle + 0.2);
      }
    }
  }

  takeDamage(amount: number) {
    if (this.isInvincible) return;

    this.hp -= amount;
    this.scene.cameras.main.shake(100, 0.01);

    this.isInvincible = true;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(500, () => {
      this.isInvincible = false;
      this.clearTint();
    });

    if (this.hp <= 0) {
      this.scene.gameOver();
    }
  }

  gainXp(amount: number) {
    this.xp += amount;
    if (this.xp >= this.nextLevelXp) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.nextLevelXp;
    this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);

    this.hp = Math.min(this.hp + 20, this.stats.maxHp);

    const choices = this.scene.upgradeManager.getRandomUpgrades(3);
    this.scene.events.emit("levelUp", choices);
  }
}
