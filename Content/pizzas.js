window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
};

window.Pizzas = {
  s001: {
    name: "Slice Samurai",
    description: "Basic bitch",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions: ["clumsyStatus", "saucyStatus", "damage1"],
  },
  s002: {
    name: "Bacon Bridge",
    description: "A salty warrior who fears nothing",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions: ["damage1", "saucyStatus", "clumsyStatus"],
  },
  v001: {
    name: "Call me Kale",
    description: "Enemy starter",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions: ["saucyStatus", "damage1"],
  },
  f001: {
    name: "Portobello Express",
    description: "Enemey boss",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions: ["damage1"],
  },
};
