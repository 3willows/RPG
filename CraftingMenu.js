class CraftingMenu {
  constructor(config) {
    this.pizzas = config.pizzas;
    this.onComplete = config.onComplete;
  }

  getOptions() {
    return this.pizzas.map((id) => {
      const base = window.Pizzas[id];
      return {
        label: base.name,
        description: base.description,
        handler: () => {
          window.playerState.addPizza(id);
          this.close();
        },
      };
    });
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = `
            <h2>Create a Pizza</h2>
        `;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    this.createElement();

    this.keyboardMenu = new KeyboardMenu({
      container: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions());

    container.appendChild(this.element);
  }
}
