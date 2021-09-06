import Character from "./Character";

export class Undead extends Character {
  constructor(level, type) {
    super(level, type);
    this.attack = 40;
    this.defence = 10;
  }
}

export class Daemon extends Character {
  constructor(level, type) {
    super(level, type);
    this.attack = 10;
    this.defence = 40;
  }
}

export class Vampire extends Character {
  constructor(level, type) {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
  }
}
