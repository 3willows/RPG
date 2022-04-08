class BattleEvent {
  constructor(event, battle) {
    this.event = event;
    this.battle = battle;
  }

  textMessage(resolve) {
    const text = this.event.text
      .replace("{CASTER}", this.event.caster?.name)
      .replace("{TARGET}", this.event.target?.name)
      .replace("{ACTION}", this.event.action?.name);

    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve();
      },
    });
    message.init(this.battle.element);
  }

  async stateChange(resolve) {
    const { caster, target, damage, recover, status, action } = this.event;

    let who = this.event.onCaster ? caster : target;
    if (action.targetType === "friendly") {
      who = caster;
    }

    if (damage) {
      // modify the target to have less HP
      target.update({ hp: target.hp - damage });

      // start blinking
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    if (recover) {
      let newHp = who.hp + recover;
      if (newHp > who.maxHp) {
        newHp = who.maxHp;
      }

      who.update({ hp: newHp });
    }

    if (status) {
      who.update({ status: { ...status } });
    }
    if (status === null) {
      who.update({ status: null });
    }

    // Wait a little bit
    await utils.wait(600);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    // stop the damage blinking
    target.pizzaElement.classList.remove("battle-damage-blink");

    resolve();
  }

  animation(resolve) {
    const fn = window.BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }

  submissionMenu(resolve) {
    const { caster } = this.event;

    const menu = new SubmissionMenu({
      caster: this.event.caster,
      enemy: this.event.enemy,
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter(
        (combatant) => {
          return (
            combatant.id != caster.id &&
            caster.team === combatant.team &&
            combatant.hp > 0
          );
        }
      ),
      onComplete: (submission) => {
        // arguments which you pass in the resolve,
        // is the return value of a promise being resolved
        resolve(submission);
      },
    });
    menu.init(this.battle.element);
  }

  replacementMenu(resolve) {
    const menu = new ReplacementMenu({
      replacements: Object.values(this.battle.combatants).filter(
        (combatant) => {
          return combatant.team === this.event.team && combatant.hp > 0;
        }
      ),
      onComplete: (replacement) => {
        resolve(replacement);
      },
    });
    menu.init(this.battle.element);
  }

  async replace(resolve) {
    const { replacement } = this.event;

    // Clear out the previous combatant
    const prevCombatant =
      this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombatant.update();
    await utils.wait(400);

    // In with the new combatant
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    resolve();
  }

  async givesXp(resolve) {
    // changing the xp frame by frame to gain more control as it completes
    // unlike how hp gain is handeled (hp value is just increased and updating dom element and css)
    let amount = this.event.xp;
    const { combatant } = this.event;

    const step = () => {
      if (amount > 0) {
        amount -= 1;
        combatant.xp += 1;

        if (combatant.xp === combatant.maxXp) {
          combatant.level += 1;
          combatant.xp = 0;
          combatant.maxXp = combatant.maxXp * 1.5;
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}
