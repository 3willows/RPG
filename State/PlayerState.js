class PlayerState {
  constructor() {
    this.pizzas = {
      p1: {
        pizzaId: "s001",
        hp: 50,
        maxHp: 50,
        xp: 95,
        maxXp: 100,
        level: 1,
        status: null,
      },
      p2: {
        pizzaId: "s002",
        hp: 30,
        maxHp: 50,
        xp: 75,
        maxXp: 100,
        level: 1,
        status: null,
      },
      p3: {
        pizzaId: "v001",
        hp: 10,
        maxHp: 100,
        xp: 99,
        maxXp: 100,
        level: 1,
        status: null,
      },
    };

    this.storyFlags = {
      // DEFEATED_LVL1_MONSTER: true,
      // USED_PIZZA_STONE: true,
    };

    this.lineup = ["p1", "p2"];
    this.items = [{ actionId: "item_recoveryStatus", instanceId: "item1" }];
  }

  addPizza(pizzaId) {
    const newId = `p${Date.now()}` + `${Math.floor(Math.random() * 99999)}`;
    this.pizzas[newId] = {
      pizzaId,
      hp: 200,
      maxHp: 300,
      xp: 295,
      maxXp: 300,
      level: 3,
      status: null,
    };

    if (this.lineup.length < 3) {
      this.lineup.push(newId);
      utils.emitEvent("LineupChanged");
    }
  }

  swapLineup(oldId, newId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = newId;

    utils.emitEvent("LineupChanged");
  }

  moveToFront(frontId) {
    this.lineup = this.lineup.filter((id) => id !== frontId);
    this.lineup.unshift(frontId);
    utils.emitEvent("LineupChanged");
  }
}

window.playerState = new PlayerState();
