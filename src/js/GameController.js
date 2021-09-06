import themes from "./themes";
import {Swordsman, Magician, Bowman} from "./playerCharacters"
import {Undead, Daemon, Vampire} from "./npcCharacters"
import {generateTeam} from './generators'
import PositionedCharacter from "./PositionedCharacter";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const playerTeam = generateTeam([Swordsman, Bowman], 1, 2);
    const npcTeam = generateTeam([Undead, Daemon, Vampire], 1, 2);
    let charAtPos = [];
    let position = 56;
    for(let char of playerTeam) {
      charAtPos.push(new PositionedCharacter(char, position));
      position++
    }
    this.gamePlay.redrawPositions(charAtPos);

    charAtPos = [];
    position = 62
    for(let char of npcTeam) {
      charAtPos.push(new PositionedCharacter(char, position));
      position++
    }
    this.gamePlay.redrawPositions(charAtPos);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
  }
  onEnter() {

  }
  newMethod() {
    this.gamePlay.addCellEnterListener(this.onCellEnter)
  }
  onCellEnter(index) {
    console.log(index);

    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
