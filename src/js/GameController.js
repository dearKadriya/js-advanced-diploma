import themes from "./themes";
import {Swordsman, Magician, Bowman} from "./playerCharacters"
import {Undead, Daemon, Vampire} from "./npcCharacters"
import {generateTeam} from './generators'
import PositionedCharacter from "./PositionedCharacter";
import GamePlay from "./GamePlay";
import Character from "./Character";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const playerTeam = generateTeam([Swordsman, Bowman], 1, 2);
    const npcTeam = generateTeam([Undead, Daemon, Vampire], 1, 2);
    console.log(playerTeam)
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
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index))
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    const cell = this.gamePlay.cells[index]
    if (cell.querySelector('.character')) {
      this.gamePlay.showCellTooltip(`U+1F396`, index)
    }

    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
