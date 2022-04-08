class PauseMenu {
  constructor({ progress, onComplete }) {
    this.progress = progress;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    if (pageKey === "root") {
      const lineupPizzas = window.playerState.lineup.map((id) => {
        const { pizzaId } = window.playerState.pizzas[id];
        const base = window.Pizzas[pizzaId];
        return {
          label: base.name,
          description: base.description,
          handler: () => this.keyboardMenu.setOptions(this.getOptions(id)),
        };
      });

      return [
        ...lineupPizzas,
        {
          label: "Save",
          description: "Save your progress",
          handler: () => {
            this.progress.save();
            this.close();
          },
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          },
        },
      ];
    }

    // Case 2, show options for just one pizza
    const unequipped = Object.keys(playerState.pizzas)
      .filter((id) => {
        return playerState.lineup.indexOf(id) === -1;
      })
      .map((id) => {
        const { pizzaId } = window.playerState.pizzas[id];
        const base = window.Pizzas[pizzaId];

        return {
          label: `Swap For ${base.name}`,
          description: base.description,
          handler: () => {
            window.playerState.swapLineup(pageKey, id);
            this.keyboardMenu.setOptions(this.getOptions("root"));
          },
        };
      });

    return [
      ...unequipped,
      {
        label: "Move to front",
        description: "Move this pizza to the front of the lineup",
        handler: () => {
          window.playerState.moveToFront(pageKey);
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
      {
        label: "Back",
        description: "Back to the root menu",
        handler: () => this.keyboardMenu.setOptions(this.getOptions("root")),
      },
    ];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = `
            <h2>Pause Menu</h2>

        `;
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();

    this.keyboardMenu = new KeyboardMenu({
      container: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    // Escape key is used to both open and close the pause menu
    // so wait a litte bit before being able to close it
    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });
  }
}
