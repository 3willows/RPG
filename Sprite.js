class Sprite {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    // Shadow
    this.shadow = new Image();
    this.useShadow = config.useShadow || true;
    if (this.useShadow) {
      this.shadow.src = "/images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.shadowIsLoaded = true;
    };

    // Configuring animation and initial state
    this.animations = config.animations || {
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],

      "walk-down": [
        [1, 0],
        [0, 0],
        [3, 0],
        [0, 0],
      ],
      "walk-right": [
        [1, 1],
        [0, 1],
        [3, 1],
        [0, 1],
      ],
      "walk-up": [
        [1, 2],
        [0, 2],
        [3, 2],
        [0, 2],
      ],
      "walk-left": [
        [1, 3],
        [0, 3],
        [3, 3],
        [0, 3],
      ],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    // cadence, how many pixels to move before moving animation forward
    this.animationFrameLimit = config.animationFrameLimit || 4;
    this.animationFrameProgress = this.animationFrameLimit;

    // Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    if (key !== this.currentAnimation) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameLimit = this.animationFrameLimit || 4;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationFrame() {
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame =
      (this.currentAnimationFrame + 1) %
      this.animations[this.currentAnimation].length;
  }

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

    this.shadowIsLoaded && ctx.drawImage(this.shadow, x, y);

    const [frameX, frameY] = this.frame;

    this.isLoaded &&
      ctx.drawImage(
        this.image,
        frameX * 32, //topleft x cut(from img)
        frameY * 32, //topleft y cut(from img)
        32, //width of cut(from img)
        32, //height of cut(from img)
        x, //topleft x(location on canvas)
        y, //topleft y(location on canvas)
        32, //width of image(on canvas)
        32 //height of image(on canvas)
      );

    this.updateAnimationFrame();
  }
}
