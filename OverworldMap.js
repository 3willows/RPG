class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.id = config.id;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};

    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;

    this.Paused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      0 + utils.withGrid(10.5) - cameraPerson.x,
      0 + utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      0 + utils.withGrid(10.5) - cameraPerson.x,
      0 + utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const [x, y] = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;
      object.mount(this);
    });
  }

  async startCutScene(events) {
    if (!events.length || this.isCutscenePlaying) return;
    this.isCutscenePlaying = true;

    // start a loop of async events
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({ map: this, event: events[i] });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;
    // if paused and movement into the cell happens at the same time,
    // isCutscenePlaying doesnt change to false quick enough, so adding an extra check
    // pause is always sent as an event by itself so events[0] is fine
    if (events[0].type === "pause") this.checkForFootstepCutscene();

    // Reset the NPCs to do their idle behavior
    Object.keys(this.gameObjects).forEach((key) => {
      const obj = this.gameObjects[key];

      // if object is already retrying its behaviour, or game was paused whilst movingProgressRemaining
      // then no need to double invoke behavior event
      if (!obj.retry) obj.doBehaviorEvent(this);
    });
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      if (object.movingProgressRemaining) {
        // hero must stop the other object from moving before talking to it
        // if you try to talk to a moving object, there will be a moving in wrong direction overlap bug
        return;
      }
      return `${object.x},${object.y}` === `${nextCoords[0]},${nextCoords[1]}`;
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return window.playerState.storyFlags[sf];
        });
      });

      relevantScenario && this.startCutScene(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match && match.length) {
      this.startCutScene(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const [x, y] = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    started: false,
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        // isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I like you", faceHero: "npcA" },
              {
                type: "textMessage",
                text: "Dont disturb me in the middle of my workout",
              },
              { type: "textMessage", text: "Whatever bitch" },
            ],
          },
        ],
      }),
      npcB: new Person({
        // isPlayerControlled: true,
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        behaviorLoop: [
          // { type: "stand", direction: "left", time: 300 },
          // { type: "stand", direction: "down", time: 200 },
          // { type: "stand", direction: "up", time: 300 },
          // { type: "stand", direction: "right", time: 200 },
        ],
        talking: [
          {
            required: ["DEFEATED_LVL1_MONSTER"],
            events: [
              {
                type: "textMessage",
                text: "I am so sorry for disrespecting you earlier",
                faceHero: "npcB",
              },
              {
                type: "textMessage",
                text: "Thats right bitch, know ur place",
              },
            ],
          },
          {
            events: [
              { type: "textMessage", text: "Sup bitch?", faceHero: "npcB" },
              {
                type: "textMessage",
                text: "Oh, u wanna go?lets fuking GO BITCH BOY!!",
              },
              { type: "battle", enemyId: "erio" },
            ],
          },
        ],
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["f001", "v001"],
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "Bitch, u cant go in there" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        { events: [{ type: "changeMap", map: "Kitchen" }] },
      ],
    },
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    started: false,
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/hero.png",
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            required: ["DEFEATED_LVL1_MONSTER"],
            events: [
              {
                type: "textMessage",
                text: "I see that you have defeated level 1 monster",
                faceHero: "npcB",
              },
              {
                type: "textMessage",
                text: "Yes I have milady",
              },
              {
                type: "textMessage",
                text: "But I still dont like you so get out",
              },
              {
                type: "spawn",
                location: { x: 5, y: 7 },
                who: "hero",
                map: "DemoRoom",
                direction: "right",
              },
              {
                type: "changeMap",
                map: "DemoRoom",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You must defeat the level 1 monster before entering this map!!",
                faceHero: "npcB",
              },
              {
                type: "spawn",
                location: { x: 7, y: 5 },
                who: "hero",
                map: "DemoRoom",
                direction: "right",
              },
              {
                type: "changeMap",
                map: "DemoRoom",
              },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        { events: [{ type: "changeMap", map: "Street" }] },
      ],
    },
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29, 9)]: [
        {
          events: [{ type: "changeMap", map: "DemoRoom" }],
        },
      ],
    },
  },
};
