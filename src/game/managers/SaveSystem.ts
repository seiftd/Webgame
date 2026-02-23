export default class SaveSystem {
  static loadMetaStats() {
    const data = localStorage.getItem("cursed_arena_meta");
    if (data) {
      return JSON.parse(data);
    }
    return {
      damageBoost: 0,
      hpBoost: 0,
      speedBoost: 0,
      currency: 0,
    };
  }

  static saveMetaStats(stats: any) {
    localStorage.setItem("cursed_arena_meta", JSON.stringify(stats));
  }
}
