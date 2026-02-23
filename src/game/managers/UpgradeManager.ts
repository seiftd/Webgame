import MainScene from "../scenes/MainScene";
import Phaser from "phaser";

export default class UpgradeManager {
  scene: MainScene;

  availableUpgrades = [
    {
      id: "dmg_up",
      name: "Sharp Blade",
      description: "+20% Damage",
      type: "stat",
    },
    { id: "hp_up", name: "Vitality", description: "+50 Max HP", type: "stat" },
    {
      id: "spd_up",
      name: "Swiftness",
      description: "+15% Speed",
      type: "stat",
    },
    {
      id: "atk_spd_up",
      name: "Adrenaline",
      description: "+20% Attack Speed",
      type: "stat",
    },
    {
      id: "crit_up",
      name: "Precision",
      description: "+10% Crit Chance",
      type: "stat",
    },
    {
      id: "fire_aura",
      name: "Fire Aura",
      description: "Burns nearby enemies",
      type: "aura",
    },
    {
      id: "life_steal",
      name: "Vampirism",
      description: "Heal 5% on kill",
      type: "passive",
    },
    {
      id: "chain_lightning",
      name: "Chain Lightning",
      description: "Attacks bounce to nearby enemies",
      type: "passive",
    },
    {
      id: "poison_trail",
      name: "Poison Trail",
      description: "Leave a damaging trail",
      type: "aura",
    },
    {
      id: "shadow_clone",
      name: "Shadow Clone",
      description: "Shoot an extra projectile",
      type: "passive",
    },
  ];

  activeUpgrades: any[] = [];

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  getRandomUpgrades(count: number) {
    const shuffled = [...this.availableUpgrades].sort(
      () => 0.5 - Math.random(),
    );
    return shuffled.slice(0, count);
  }

  applyUpgrade(upgrade: any) {
    this.activeUpgrades.push(upgrade);
    const player = this.scene.player;

    switch (upgrade.id) {
      case "dmg_up":
        player.stats.damage *= 1.2;
        break;
      case "hp_up":
        player.stats.maxHp += 50;
        player.hp += 50;
        break;
      case "spd_up":
        player.stats.speed *= 1.15;
        break;
      case "atk_spd_up":
        player.stats.attackSpeed *= 0.8;
        break;
      case "crit_up":
        player.stats.critChance += 0.1;
        break;
    }
  }

  update(time: number, delta: number) {
    if (this.activeUpgrades.some((u) => u.id === "fire_aura")) {
      if (time % 1000 < delta) {
        this.scene.enemyManager.enemies.getChildren().forEach((enemy: any) => {
          if (!enemy.active) return;
          const dist = Phaser.Math.Distance.Between(
            this.scene.player.x,
            this.scene.player.y,
            enemy.x,
            enemy.y,
          );
          if (dist < 100) {
            this.scene.enemyManager.damageEnemy(enemy, 5);
          }
        });
      }
    }

    if (this.activeUpgrades.some((u) => u.id === "poison_trail")) {
      if (
        time % 500 < delta &&
        (this.scene.player.body!.velocity.x !== 0 ||
          this.scene.player.body!.velocity.y !== 0)
      ) {
        const poison = this.scene.add.circle(
          this.scene.player.x,
          this.scene.player.y,
          20,
          0x00ff00,
          0.5,
        );
        this.scene.physics.add.existing(poison);
        (poison.body as Phaser.Physics.Arcade.Body).setCircle(20);

        this.scene.time.delayedCall(3000, () => {
          poison.destroy();
        });

        this.scene.physics.add.overlap(
          poison,
          this.scene.enemyManager.enemies,
          (p: any, enemy: any) => {
            if (time % 1000 < delta) {
              this.scene.enemyManager.damageEnemy(enemy, 2);
            }
          },
        );
      }
    }
  }
}
