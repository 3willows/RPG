const utils = {
  withGrid(n) {
    return n * 16;
  },

  asGridCoord(x, y) {
    return `${x * 16},${y * 16}`;
  },

  nextPosition(initialX, initialY, direction) {
    if (direction === "up") return [initialX, initialY - 16];
    if (direction === "down") return [initialX, initialY + 16];
    if (direction === "left") return [initialX - 16, initialY];
    if (direction === "right") return [initialX + 16, initialY];
  },

  oppositeDirection(direction) {
    if (direction === "left") return "right";
    if (direction === "right") return "left";
    if (direction === "up") return "down";
    return "up";
  },

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  },

  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail,
    });

    document.dispatchEvent(event);
  },
};
