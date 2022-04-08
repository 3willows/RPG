class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      { map: this.map },
      { type: "stand", direction: this.event.direction, time: this.event.time }
    );
    who.updateSprite();

    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonStandComplete", completeHandler);
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];

    who.startBehavior(
      { map: this.map },
      { type: "walk", direction: this.event.direction, retry: true }
    );
    // who.updateSprite();

    // Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = (e) => {
      //   console.log(e);
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };
    // listener for a custom signal personWalkingComplete
    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });

    message.init(document.querySelector(".game-container"));
  }

  changeMap(resolve) {
    const x = this.map.gameObjects["hero"].x;
    const y = this.map.gameObjects["hero"].y;
    this.map.removeWall(x, y);

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      resolve();
      sceneTransition.fadeOut();
    });
  }

  spawn(resolve) {
    const { x: newX, y: newY } = this.event.location;
    const map = window.OverworldMaps[this.event.map];
    const obj = map.gameObjects[this.event.who];

    obj.x = utils.withGrid(newX);
    obj.y = utils.withGrid(newY);
    obj.direction = this.event.direction;
    resolve();
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: window.Enemies[this.event.enemyId],
      onComplete: () => {
        resolve();
      },
    });
    battle.init(document.querySelector(".game-container"));
  }

  pause(resolve) {
    this.map.Paused = true;

    this.menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.Paused = false;
        this.map.overworld.startGameLoop();
      },
    });
    this.menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  init() {
    return new Promise((resolve) => {
      // this.stand(resolve) or this.walk(resolve)
      this[this.event.type](resolve);
    });
  }
}
