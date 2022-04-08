class SubmissionMenu {
  constructor({ caster, enemy, items, onComplete, replacements }) {
    this.caster = caster;
    this.enemy = enemy;
    this.onComplete = onComplete;
    this.replacements = replacements;

    // battle items
    let quantityMap = {};
    items.forEach((item) => {
      if (item.team === caster.team) {
        if (quantityMap[item.actionId]) {
          quantityMap[item.actionId].quantity += 1;
        } else {
          quantityMap[item.actionId] = {
            actionId: item.actionId,
            quantity: 1,
            instanceId: item.instanceId,
          };
        }
      }
    });
    this.items = Object.values(quantityMap);
  }

  getPages() {
    const backOption = {
      label: "Go Back",
      description: "Return to previous page",
      handler: () => this.keyboardMenu.setOptions(this.getPages().root),
    };

    return {
      root: [
        {
          label: "Attack",
          description: "Choose an attack",
          handler: () => {
            // go to attacks page
            this.keyboardMenu.setOptions(this.getPages().attacks);
          },
        },
        {
          label: "Items",
          description: "Choose an item",
          handler: () => {
            // go to items page
            this.keyboardMenu.setOptions(this.getPages().items);
          },
        },
        {
          label: "Swap",
          description: "Change to another pizza",
          // disabled: true,
          handler: () => {
            // show pizza options
            this.keyboardMenu.setOptions(this.getPages().replacements);
          },
        },
      ],
      attacks: [
        ...this.caster.actions.map((actionKey) => {
          const action = window.Actions[actionKey];
          return {
            label: action.name,
            description: action.description,
            handler: () => {
              this.menuSubmit(action);
            },
          };
        }),
        backOption,
      ],
      items: [
        ...this.items.map((item) => {
          const action = window.Actions[item.actionId];
          return {
            label: action.name,
            description: action.description,
            right: () => {
              return "x" + item.quantity;
            },
            handler: () => {
              this.menuSubmit(action, item.instanceId);
            },
          };
        }),
        backOption,
      ],
      replacements: [
        ...this.replacements.map((replacement) => {
          return {
            label: replacement.name,
            description: replacement.description,
            handler: () => {
              // swap the pizza
              this.menuSubmitReplacement(replacement);
            },
          };
        }),
        backOption,
      ],
    };
  }

  menuSubmitReplacement(replacement) {
    this.keyboardMenu?.end();
    this.onComplete({
      replacement,
    });
  }

  menuSubmit(action, instanceId = null) {
    this.keyboardMenu?.end();

    this.onComplete({
      action,
      target: action.targetType === "friendly" ? this.caster : this.enemy,
      instanceId,
    });
  }

  decide() {
    // TODO: randomised attacks from enemy side
    this.menuSubmit(window.Actions[this.caster.actions[0]]);
  }

  showMenu(container) {
    this.keyboardMenu = new KeyboardMenu();
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions(this.getPages().root);
  }

  init(container) {
    if (this.caster.isPlayerControlled) {
      // show the UI
      this.showMenu(container);
    } else {
      this.decide();
    }
  }
}
