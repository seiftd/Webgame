import Phaser from "phaser";
import MainScene from "./MainScene";

export default class UIScene extends Phaser.Scene {
  mainScene!: MainScene;
  hpBar!: Phaser.GameObjects.Graphics;
  xpBar!: Phaser.GameObjects.Graphics;
  roomText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  seedText!: Phaser.GameObjects.Text;

  constructor() {
    super("UIScene");
  }

  init(data: { mainScene: MainScene }) {
    this.mainScene = data.mainScene;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.hpBar = this.add.graphics();
    this.xpBar = this.add.graphics();

    this.roomText = this.add.text(16, 16, `Room: ${this.mainScene.roomCount}`, {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    this.timerText = this.add
      .text(width / 2, 16, "00:00", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5, 0);

    this.seedText = this.add
      .text(width - 16, 16, `Seed: ${this.mainScene.seed}`, {
        fontSize: "16px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);

    this.mainScene.events.on("levelUp", this.showUpgradePanel, this);
  }

  update() {
    this.drawHpBar();
    this.drawXpBar();

    const seconds = Math.floor(this.mainScene.runTimer / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.setText(
      `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
    );
    this.roomText.setText(`Room: ${this.mainScene.roomCount}`);
  }

  drawHpBar() {
    this.hpBar.clear();
    const player = this.mainScene.player;
    if (!player) return;

    const width = 200;
    const height = 20;
    const x = 16;
    const y = this.scale.height - 40;

    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(x, y, width, height);

    const percent = Math.max(0, player.hp / player.stats.maxHp);
    this.hpBar.fillStyle(0xff0000, 1);
    this.hpBar.fillRect(x, y, width * percent, height);
  }

  drawXpBar() {
    this.xpBar.clear();
    const player = this.mainScene.player;
    if (!player) return;

    const width = this.scale.width;
    const height = 10;
    const x = 0;
    const y = this.scale.height - 10;

    this.xpBar.fillStyle(0x333333, 1);
    this.xpBar.fillRect(x, y, width, height);

    const percent = Math.max(0, player.xp / player.nextLevelXp);
    this.xpBar.fillStyle(0x00ffff, 1);
    this.xpBar.fillRect(x, y, width * percent, height);
  }

  showUpgradePanel(choices: any[]) {
    this.mainScene.scene.pause();

    const width = this.scale.width;
    const height = this.scale.height;

    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      600,
      400,
      0x000000,
      0.8,
    );
    panel.setStrokeStyle(4, 0xffffff);

    const title = this.add
      .text(width / 2, height / 2 - 150, "LEVEL UP! Choose an Upgrade", {
        fontSize: "32px",
        color: "#ffff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const buttons: any[] = [];

    choices.forEach((choice, index) => {
      const y = height / 2 - 50 + index * 80;

      const btnBg = this.add
        .rectangle(width / 2, y, 500, 60, 0x333333, 1)
        .setInteractive({ useHandCursor: true });
      btnBg.setStrokeStyle(2, 0xaaaaaa);

      const text = this.add
        .text(width / 2, y, `${choice.name}: ${choice.description}`, {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: "monospace",
        })
        .setOrigin(0.5);

      btnBg.on("pointerover", () => btnBg.setFillStyle(0x555555));
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x333333));
      btnBg.on("pointerdown", () => {
        this.mainScene.upgradeManager.applyUpgrade(choice);

        panel.destroy();
        title.destroy();
        buttons.forEach((b) => {
          b.bg.destroy();
          b.text.destroy();
        });

        this.mainScene.scene.resume();
      });

      buttons.push({ bg: btnBg, text: text });
    });
  }
}
