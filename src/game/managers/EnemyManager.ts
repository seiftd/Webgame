import Phaser from "phaser";
import MainScene from "../scenes/MainScene";

export default class EnemyManager {
  scene: MainScene;
  enemies: Phaser.Physics.Arcade.Group;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.enemies = this.scene.physics.add.group();
  }

  spawnWave(roomNumber: number) {
    if (roomNumber % 5 === 0) {
      this.spawnBoss(roomNumber);
      return;
    }

    const numEnemies = 3 + Math.floor(roomNumber * 1.5);

    for (let i = 0; i < numEnemies; i++) {
      const x = Phaser.Math.Between(
        100,
        this.scene.dungeonManager.roomWidth * 64 - 100,
      );
      const y = Phaser.Math.Between(
        100,
        this.scene.dungeonManager.roomHeight * 64 - 200,
      );

      const type = Phaser.Math.RND.pick([
        "enemy_melee",
        "enemy_ranged",
        "enemy_tank",
        "enemy_exploder",
        "enemy_summoner",
      ]);

      this.spawnEnemy(x, y, type, roomNumber);
    }
  }

  spawnBoss(roomNumber: number) {
    const x = (this.scene.dungeonManager.roomWidth * 64) / 2;
    const y = (this.scene.dungeonManager.roomHeight * 64) / 2;

    const boss: any = this.enemies.create(x, y, "boss");
    boss.type = "boss";
    boss.setCollideWorldBounds(true);
    boss.setBounce(0.5);

    const multiplier = 1 + roomNumber * 0.2;
    boss.hp = 500 * multiplier;
    boss.maxHp = boss.hp;
    boss.speed = 80 * multiplier;
    boss.damage = 30 * multiplier;
    boss.lastAttackTime = 0;
    boss.phase = 1;
  }

  spawnEnemy(x: number, y: number, type: string, roomNumber: number) {
    const enemy: any = this.enemies.create(x, y, type);
    enemy.type = type;
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);

    const multiplier = 1 + roomNumber * 0.1;

    if (type === "enemy_melee") {
      enemy.hp = 50 * multiplier;
      enemy.speed = 100 * multiplier;
      enemy.damage = 10 * multiplier;
    } else if (type === "enemy_ranged") {
      enemy.hp = 30 * multiplier;
      enemy.speed = 80 * multiplier;
      enemy.damage = 15 * multiplier;
      enemy.lastShootTime = 0;
    } else if (type === "enemy_tank") {
      enemy.hp = 150 * multiplier;
      enemy.speed = 50 * multiplier;
      enemy.damage = 20 * multiplier;
    } else if (type === "enemy_exploder") {
      enemy.hp = 20 * multiplier;
      enemy.speed = 120 * multiplier;
      enemy.damage = 40 * multiplier;
    } else if (type === "enemy_summoner") {
      enemy.hp = 60 * multiplier;
      enemy.speed = 60 * multiplier;
      enemy.damage = 5 * multiplier;
      enemy.lastSummonTime = 0;
    }
  }

  update(time: number, delta: number, player: any) {
    this.enemies.getChildren().forEach((enemy: any) => {
      if (!enemy.active) return;

      const dist = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y,
      );

      if (enemy.type === "enemy_melee" || enemy.type === "enemy_tank") {
        this.scene.physics.moveToObject(enemy, player, enemy.speed);
      } else if (enemy.type === "enemy_ranged") {
        if (dist > 200) {
          this.scene.physics.moveToObject(enemy, player, enemy.speed);
        } else if (dist < 150) {
          const angle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            enemy.x,
            enemy.y,
          );
          this.scene.physics.velocityFromRotation(
            angle,
            enemy.speed,
            enemy.body.velocity,
          );
        } else {
          enemy.setVelocity(0, 0);
        }

        if (time - enemy.lastShootTime > 2000) {
          enemy.lastShootTime = time;
          const angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            player.x,
            player.y,
          );
          const proj = this.scene.enemyProjectiles.get(
            enemy.x,
            enemy.y,
            "projectile",
          );
          if (proj) {
            proj.setActive(true).setVisible(true);
            proj.setTint(0xff0000);
            this.scene.physics.velocityFromRotation(
              angle,
              200,
              proj.body.velocity,
            );

            this.scene.time.delayedCall(3000, () => {
              if (proj.active) proj.destroy();
            });
          }
        }
      } else if (enemy.type === "enemy_exploder") {
        this.scene.physics.moveToObject(enemy, player, enemy.speed);
        if (dist < 50) {
          this.scene.player.takeDamage(enemy.damage);
          enemy.destroy();
          // Explosion effect
          const explosion = this.scene.add.circle(
            enemy.x,
            enemy.y,
            60,
            0xffaa00,
            0.5,
          );
          this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            duration: 300,
            onComplete: () => explosion.destroy(),
          });
        }
      } else if (enemy.type === "enemy_summoner") {
        if (dist < 300) {
          const angle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            enemy.x,
            enemy.y,
          );
          this.scene.physics.velocityFromRotation(
            angle,
            enemy.speed,
            enemy.body.velocity,
          );
        } else {
          enemy.setVelocity(0, 0);
        }

        if (time - enemy.lastSummonTime > 5000) {
          enemy.lastSummonTime = time;
          this.spawnEnemy(
            enemy.x + Phaser.Math.Between(-50, 50),
            enemy.y + Phaser.Math.Between(-50, 50),
            "enemy_melee",
            this.scene.roomCount,
          );
        }
      } else if (enemy.type === "boss") {
        this.scene.physics.moveToObject(enemy, player, enemy.speed);

        if (enemy.hp < enemy.maxHp * 0.5 && enemy.phase === 1) {
          enemy.phase = 2;
          enemy.speed *= 1.5;
          enemy.setTint(0xff0000);
        }

        if (time - enemy.lastAttackTime > (enemy.phase === 1 ? 2000 : 1000)) {
          enemy.lastAttackTime = time;

          // Ring of projectiles
          for (let i = 0; i < 8; i++) {
            const angle = ((Math.PI * 2) / 8) * i;
            const proj = this.scene.enemyProjectiles.get(
              enemy.x,
              enemy.y,
              "projectile",
            );
            if (proj) {
              proj.setActive(true).setVisible(true);
              proj.setTint(0xff00ff);
              proj.setScale(2);
              this.scene.physics.velocityFromRotation(
                angle,
                150,
                proj.body.velocity,
              );

              this.scene.time.delayedCall(4000, () => {
                if (proj.active) proj.destroy();
              });
            }
          }
        }
      }
    });
  }

  damageEnemy(enemy: any, amount: number, isCrit: boolean = false) {
    enemy.hp -= amount;

    enemy.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (enemy.active) enemy.clearTint();
    });

    const angle = Phaser.Math.Angle.Between(
      this.scene.player.x,
      this.scene.player.y,
      enemy.x,
      enemy.y,
    );
    this.scene.physics.velocityFromRotation(angle, 200, enemy.body.velocity);

    const dmgText = this.scene.add
      .text(enemy.x, enemy.y - 20, amount.toString(), {
        fontSize: isCrit ? "24px" : "16px",
        color: isCrit ? "#ffff00" : "#ffffff",
        fontFamily: "monospace",
        fontStyle: isCrit ? "bold" : "normal",
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: dmgText,
      y: enemy.y - 40,
      alpha: 0,
      duration: 500,
      onComplete: () => dmgText.destroy(),
    });

    if (enemy.hp <= 0) {
      if (
        this.scene.upgradeManager.activeUpgrades.some(
          (u) => u.id === "life_steal",
        )
      ) {
        this.scene.player.hp = Math.min(
          this.scene.player.hp + this.scene.player.stats.maxHp * 0.05,
          this.scene.player.stats.maxHp,
        );
      }

      const gem = this.scene.xpGems.create(enemy.x, enemy.y, "xp_gem");
      gem.setBounce(0.5);

      enemy.destroy();

      if (this.enemies.countActive(true) === 0) {
        this.scene.dungeonManager.doors.getChildren().forEach((door: any) => {
          door.setTint(0x00ff00);
        });
      }
    }
  }
}
