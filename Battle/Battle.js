class Battle {
  constructor({ enemy, onComplete }) {
    this.enemy = enemy;
    this.onComplete = onComplete;

    this.combatants = {
      // player1: new Combatant(
      //   {
      //     ...window.Pizzas.s001,
      //     team: "player",
      //     hp: 20,
      //     maxHp: 50,
      //     xp: 90,
      //     maxXp: 100,
      //     level: 1,
      //     status: null,
      //     isPlayerControlled: true,
      //   },
      //   this
      // ),
      // player2: new Combatant(
      //   {
      //     ...window.Pizzas.s002,
      //     team: "player",
      //     hp: 30,
      //     maxHp: 50,
      //     xp: 75,
      //     maxXp: 100,
      //     level: 1,
      //     status: null,
      //     isPlayerControlled: true,
      //   },
      //   this
      // ),
      // enemy1: new Combatant(
      //   {
      //     ...window.Pizzas.v001,
      //     team: "enemy",
      //     hp: 3,
      //     maxHp: 50,
      //     xp: 20,
      //     maxXp: 100,
      //     level: 1,
      //   },
      //   this
      // ),
      // enemy2: new Combatant(
      //   {
      //     ...window.Pizzas.f001,
      //     team: "enemy",
      //     hp: 25,
      //     maxHp: 50,
      //     xp: 30,
      //     maxXp: 100,
      //     level: 1,
      //   },
      //   this
      // ),
    };

    this.activeCombatants = {
      player: null,
      enemy: null,
    };

    // dynamically adding the player team
    window.playerState.lineup.forEach((id) => {
      this.addCombatant(id, "player", window.playerState.pizzas[id]);
    });
    // dynamically adding the enemy team
    Object.keys(this.enemy.pizzas).forEach((key) => {
      this.addCombatant("e_" + key, "enemy", this.enemy.pizzas[key]);
    });

    // start with empty items list
    this.items = [];
    // Add in player items directly
    window.playerState.items.forEach((item) => {
      this.items.push({
        ...item,
        team: "player",
      });
    });

    this.usedInstanceIds = {};
  }

  addCombatant(id, team, config) {
    this.combatants[id] = new Combatant(
      {
        ...window.Pizzas[config.pizzaId],
        ...config,
        team,
        isPlayerControlled: team === "player",
      },
      this
    );

    // populate the first active pizza
    this.activeCombatants[team] = this.activeCombatants[team] || id;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");
    this.element.innerHTML = `
        <div class="Battle_hero">
            <img src="${"/images/characters/people/hero.png"}" alt="Hero">
        </div>
        <div class="Battle_enemy">
            <img src="${this.enemy.src}" alt="${this.enemy.name}">
        </div>
        `;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    this.playerTeam = new Team("player", "Hero");
    this.enemyTeam = new Team("enemy", "Bully");

    Object.keys(this.combatants).forEach((key) => {
      let combatant = this.combatants[key];
      // set the combatant id and initialise it
      combatant.id = key;
      combatant.init(this.element);

      // add to correct team
      if (combatant.team === "player") {
        this.playerTeam.combatants.push(combatant);
      } else if (combatant.team === "enemy") {
        this.enemyTeam.combatants.push(combatant);
      }
    });

    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: (event) => {
        return new Promise((resolve) => {
          const battleEvent = new BattleEvent(event, this);
          battleEvent.init(resolve);
        });
      },
      onWinner: async (winner) => {
        const winnerName =
          winner === "player" ? "The Sexy Angel" : this.enemy.name;
        const looserName = winner === "enemy" ? "The Sexy Angel" : "Bitch Boy";

        // messages to display at the end of the battle
        await new Promise((resolve) => {
          const battleEvent = new BattleEvent(
            {
              type: "textMessage",
              text: `${winnerName} is the winner!`,
            },
            this
          );
          battleEvent.init(resolve);
        });
        await new Promise((resolve) => {
          const battleEvent = new BattleEvent(
            {
              type: "textMessage",
              text: `Unfortunately ${looserName} has lost the battle`,
            },
            this
          );
          battleEvent.init(resolve);
        });

        // if the player wins, update the player file with level,hp,xp,items...
        if (winner === "player") {
          // updating xp,hp levels
          Object.keys(window.playerState.pizzas).forEach((id) => {
            const combatant = this.combatants[id];
            const playerStatePizza = window.playerState.pizzas[id];

            if (combatant) {
              playerStatePizza["xp"] = combatant["xp"];
              playerStatePizza["hp"] = combatant["hp"];
              playerStatePizza["maxXp"] = combatant["maxXp"];
              playerStatePizza["level"] = combatant["level"];
            }
          });

          // removing used items from inventory
          window.playerState.items.filter((item) => {
            return !this.usedInstanceIds[item.instanceId];
          });

          //Send an update signal to update hudElement
          utils.emitEvent("PlayerStateUpdated");

          // trigger any related storyflags
          if (this.enemy.name === "Erio") {
            utils.emitEvent("BATTLE_WON", {
              flag: "DEFEATED_LVL1_MONSTER",
            });
          }
        }

        // removing the battle screen
        this.element.remove();
        this.onComplete();
      },
    });
    this.turnCycle.init();
  }
}
