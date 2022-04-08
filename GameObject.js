class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = true;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/people/hero.png",
    });

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking || [];
  }

  mount(map) {
    this.isMounted = true;
    map.addWall(this.x, this.y);
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10);
  }

  update() {}

  async doBehaviorEvent(map) {
    // Dont do anything if there is a more important cutscene or behavior loop
    if (
      map.isCutscenePlaying ||
      this.behaviorLoop.length === 0 ||
      this.isStanding
    ) {
      return;
    }

    // Setting up our event with relevant info
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    // Create an event instance out of out next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });

    this.retry = true; // set retry flag to true, whilst the object is stuck in startBehaviour function
    await eventHandler.init(); // must wait for current behaviourLoopIndex to finish before moving foreward
    this.retry = false; //set retry flag back to false once the object is out of startBehaviour function

    // Setting the next event to fire
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }

    // Do it again
    this.doBehaviorEvent(map);
  }
}
