class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  startGameLoop() {
    const step = () => {
      // Clear off the canvas before drawing new layer
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      // Update game objects
      // this was separated from draw after introducing camera person,
      // because, some grahics were a little choppy
      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });

      // Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      // Draw Game objects
      Object.values(this.map.gameObjects)
        .sort((a, b) => a.y - b.y)
        .forEach((object) => {
          object.sprite.draw(this.ctx, cameraPerson);
        });

      // Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      // if paused freeze frame
      if (!this.map.Paused) {
        requestAnimationFrame(() => {
          step();
        });
      }
    };
    step();
  }

  // handle events that are invoked by pressing keyboard keys
  bindActionInput() {
    new KeyPressListener("Enter", () => {
      // Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });

    new KeyPressListener("Escape", () => {
      if (!this.map.Paused && !this.map.isCutscenePlaying) {
        this.map.startCutScene([
          {
            type: "pause",
          },
        ]);
      }
    });
  }

  // handle custom events that are related to the hero or story of the game
  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        // Heros location has changed
        this.map.checkForFootstepCutscene();
      }
    });

    document.addEventListener("BATTLE_WON", (e) => {
      window.playerState.storyFlags[e.detail.flag] = true;
    });
  }

  startMap(mapConfig, initialHeroState = null) {
    if (!window.OverworldMaps[mapConfig.id].started) {
      this.map = new OverworldMap(mapConfig);
      window.OverworldMaps[mapConfig.id].started = this.map;
      this.map.overworld = this;
      this.map.mountObjects();
    } else {
      // if map is already started, no need to start everything again
      this.map = window.OverworldMaps[mapConfig.id].started;
      // starting location of the hero might change when reopening a map (if spawned)
      this.map.addWall(
        this.map.gameObjects.hero.x,
        this.map.gameObjects.hero.y
      );
    }

    // if saved inititalHeroState is provided then update hero values
    if (initialHeroState) {
      this.map.gameObjects.hero.x = initialHeroState.x;
      this.map.gameObjects.hero.y = initialHeroState.y;
      this.map.gameObjects.hero.direction = initialHeroState.direction;
    }

    // setting initial progress values
    this.progress.mapId = this.map.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  async init() {
    // Creates a new progress tracker
    this.progress = new Progress();

    // Show the title screen
    this.titleScreen = new TitleScreen({ progress: this.progress });
    const useSaveFile = await this.titleScreen.init(this.element);

    // Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    // laoding the hud
    const hud = new Hud();
    hud.init(this.element);

    // start the first map
    console.log(this.progress);
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    // direction input listener for up,down,left,right key
    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();
    this.map.startCutScene([
      // { type: "battle", ememyId: "beth" },
      // { type: "textMessage", text: "Let the games begin" },
    ]);
  }
}
