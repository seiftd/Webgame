import Phaser from "phaser";
import SaveSystem from "../managers/SaveSystem";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width / 2, height / 4, "Cursed Arena: Loop of Doom", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const startBtn = this.add
      .text(width / 2, height / 2 - 50, "Start Run", {
        fontSize: "32px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerdown", () => {
      this.scene.start("MainScene", {
        seed: Math.random().toString(36).substring(2, 10),
      });
    });

    const metaStats = SaveSystem.loadMetaStats();

    const currencyText = this.add
      .text(width / 2, height / 2 + 20, `Currency: ${metaStats.currency}`, {
        fontSize: "24px",
        color: "#ffff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.createUpgradeButton(
      width / 2 - 200,
      height / 2 + 100,
      "Damage Boost (+5)",
      metaStats,
      "damageBoost",
      5,
      50,
      currencyText,
    );
    this.createUpgradeButton(
      width / 2,
      height / 2 + 100,
      "HP Boost (+20)",
      metaStats,
      "hpBoost",
      20,
      50,
      currencyText,
    );
    this.createUpgradeButton(
      width / 2 + 200,
      height / 2 + 100,
      "Speed Boost (+10)",
      metaStats,
      "speedBoost",
      10,
      50,
      currencyText,
    );

    this.add
      .text(
        width / 2,
        height - 50,
        "WASD/Joystick to Move | SPACE to Dash | Auto-Attack",
        {
          fontSize: "16px",
          color: "#888888",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);
  }

  createUpgradeButton(
    x: number,
    y: number,
    label: string,
    metaStats: any,
    statKey: string,
    statIncrease: number,
    cost: number,
    currencyText: Phaser.GameObjects.Text,
  ) {
    const btn = this.add
      .text(x, y, `${label}\nCost: ${cost}\nCurrent: +${metaStats[statKey]}`, {
        fontSize: "18px",
        color: "#aaaaaa",
        fontFamily: "monospace",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      if (metaStats.currency >= cost) {
        metaStats.currency -= cost;
        metaStats[statKey] += statIncrease;
        SaveSystem.saveMetaStats(metaStats);

        currencyText.setText(`Currency: ${metaStats.currency}`);
        btn.setText(`${label}\nCost: ${cost}\nCurrent: +${metaStats[statKey]}`);
      } else {
        this.cameras.main.shake(100, 0.01);
      }
    });
  }
}
