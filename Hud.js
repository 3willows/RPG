class Hud {
  constructor() {
    this.scoreboards = [];
  }

  update() {
    this.scoreboards.forEach((scoreboard) => {
      scoreboard.update({
        ...window.playerState.pizzas[scoreboard.id],
      });
    });
  }

  createElement() {
    if (this.element) {
      this.element.remove();
      this.scoreboards = [];
    }

    this.element = document.createElement("div");
    this.element.classList.add("Hud");

    const playerState = window.playerState;
    playerState.lineup.forEach((key) => {
      const pizza = playerState.pizzas[key];
      const scoreboard = new Combatant(
        {
          ...window.Pizzas[pizza.pizzaId],
          ...pizza,
          id: key,
        },
        null
      );

      scoreboard.createElement();
      this.scoreboards.push(scoreboard);
      this.element.appendChild(scoreboard.hudElement);
    });

    this.update();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    // listening for an update signal and updating
    document.addEventListener("PlayerStateUpdated", () => {
      this.update();
    });
    document.addEventListener("LineupChanged", () => {
      this.createElement();
      container.appendChild(this.element);
    });
  }
}
