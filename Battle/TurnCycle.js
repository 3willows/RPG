class TurnCycle {
  constructor({ battle, onNewEvent, onWinner }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player"; //or "enemy"
    this.onWinner = onWinner;
  }

  async turn() {
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId =
      this.battle.activeCombatants[
        this.currentTeam === "player" ? "enemy" : "player"
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });

    // If replacement stop here
    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement,
      });
      await this.onNewEvent({
        type: "textMessage",
        text: `Go get em ${submission.replacement.name}!`,
      });

      this.nextTurn();
      return;
    }

    // removing the used up item from inventory
    if (submission.instanceId) {
      // removing the item from the battle state
      this.battle.items = this.battle.items.filter(
        (item) => item.instanceId !== submission.instanceId
      );

      // storing the item instance id, to persist the changes after the battle finishes
      this.battle.usedInstanceIds[submission.instanceId] = true;
    }

    // Check for replaced events because of clumsy status
    const resultingEvents = caster.getReplacedEvents(submission.action.success);
    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    // did the target die?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: "textMessage",
        text: `${submission.target.name} is ruined`,
      });
      const playerActivePizzaId = this.battle.activeCombatants["player"];
      const xp = submission.target.givesXp;

      if (submission.target.team === "enemy") {
        await this.onNewEvent({
          type: "textMessage",
          text: `Gaining ${xp}XP!`,
        });

        await this.onNewEvent({
          type: "givesXp",
          xp: xp,
          combatant: this.battle.combatants[playerActivePizzaId],
        });
      }
    }

    // do we have a winning team
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: "textMessage",
        text: "We have a winner!",
      });
      this.onWinner(winner);
      // Battle has ended
      return;
    }

    // replacement for the dead target
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
        team: submission.target.team,
      });
      if (replacement) {
        await this.onNewEvent({
          type: "replace",
          replacement: replacement,
        });
        await this.onNewEvent({
          type: "textMessage",
          text: `${replacement.name} appears`,
        });
      }
    }

    // Check for post events because of saucy status (healing)
    const postEvents = caster.getPostEvents();
    for (let i = 0; i < postEvents.length; i++) {
      const event = {
        ...postEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };

      await this.onNewEvent(event);
    }

    // Check for status expire
    const expiredEvent = caster.decrementStatus();
    if (expiredEvent) {
      await this.onNewEvent(expiredEvent);
    }

    // switching turns
    this.nextTurn();
  }

  nextTurn() {
    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  getWinningTeam() {
    let aliveTeams = {};
    Object.values(this.battle.combatants).forEach((combtatant) => {
      if (combtatant.hp > 0) {
        aliveTeams[combtatant.team] = true;
      }
    });
    if (!aliveTeams["enemy"]) return "player";
    if (!aliveTeams["player"]) return "enemy";
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: "THE BATTLE HAS COMMENCED!!",
    });

    // start the first turn
    this.turn();
  }
}
