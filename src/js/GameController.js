import themes from "./themes";
import {Swordsman, Magician, Bowman} from "./playerCharacters"
import {Undead, Daemon, Vampire} from "./npcCharacters"
import {generateTeam, getTeamWithPosition} from './generators'
import PositionedCharacter from "./PositionedCharacter";
import GamePlay from "./GamePlay";
import Character from "./Character";
import GameState from "./GameState";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const playerTeam = generateTeam([Swordsman, Bowman, Magician], 1, 2);
    const npcTeam = generateTeam([Undead, Daemon, Vampire], 1, 2);
    this.turn('player')
    console.log(GameState.turn)
    this.gamePlay.positionedPlayersTeam = getTeamWithPosition(playerTeam, npcTeam);
    this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam);
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index))
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index))
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index))
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }


  onCellClick(index) {
    const cell = this.gamePlay.cells[index];
    console.log(cell)
    const char = this.gamePlay.positionedPlayersTeam
    if ((this.gamePlay.possiblePosition) !== undefined && (this.gamePlay.possiblePosition.includes(index))) {
      for (let position in this.gamePlay.positionedPlayersTeam) {
        //так мы определяем что нашли выбранного персонажа из списка
        if (JSON.stringify(this.gamePlay.selectedChar.position) === JSON.stringify(this.gamePlay.positionedPlayersTeam[position].position)) {
          this.gamePlay.positionedPlayersTeam[position].position = index
          this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
          let choosenState = this.gamePlay.cells[GameState.selected]
          choosenState.innerHTML = ''
          console.log(this.gamePlay.positionedPlayersTeam[position].position)
          this.getToolTip(index)
        }
      }
    }
    for (const position in char) {
      const positioned = char[position]['position']
      const types = char[position].character.type
      if (index === positioned) {
        if (types === 'bowman' || types === 'swordsman' || types === 'magician') {
          this.gamePlay.selectCell(index, 'yellow');
          this.gamePlay.selectedChar = char[position]
          if (GameState.selected === undefined) {
            this.selectedPosition(index)
          } else {
            this.gamePlay.deselectCell(GameState.selected);
            this.gamePlay.selectCell(index, 'yellow');
            this.selectedPosition(index);
          }
          console.log(this.gamePlay.selectedChar)

        } else {
          this.gamePlay.setCursor('pointer');
          GamePlay.showError('Выбирать можно только своего персонажа!')
        }
        if ((GameState.selected !== undefined)) {
          let movesWithoutOthers = this.possibleCellForMove(GameState.selected, types);
          let attack = this.possibleAttack(GameState.selected, types)
          console.log(attack)
          for (let position in char) {
            if (movesWithoutOthers.includes(char[position].position)) {
              let num = movesWithoutOthers.indexOf(char[position].position)
              if (index > -1) {
                movesWithoutOthers.splice(num, 1)
              }
            }
          }
          this.gamePlay.possiblePosition = movesWithoutOthers
        }

      }
    }

  }

  onCellEnter(index) {
    const cell = this.gamePlay.cells[index];
    const char = this.gamePlay.positionedPlayersTeam
    console.log(index)
    console.log(cell)
    if ((this.gamePlay.possiblePosition === undefined) || (!this.gamePlay.possiblePosition.includes(index))) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.setCursor('not-allowed')
    } else if ((this.gamePlay.possiblePosition !== undefined) && (this.gamePlay.possiblePosition.includes(index))) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green')
    }
    this.getToolTip(index)
  }

  onCellLeave(index) {
    const cell = this.gamePlay.cells[index];
    const char = this.gamePlay.positionedPlayersTeam
    for (const position in char) {
      if (index === char[position]['position']) {
        this.gamePlay.hideCellTooltip(index);
        this.gamePlay.deleteToolTip(cell);
        this.gamePlay.setCursor('auto')
      } else if (index !== GameState.selected) {
        this.gamePlay.deselectCell(index)
      }
    }
  }

  turn(turn) {
    const turns = {
      turn: turn
    }
    GameState.from(turns)
  }

  selectedPosition(index) {
    const selected = {
      selecting: index
    }
    GameState.from(selected)
  }

  possibleCellForMove(index, type) {
    let count = 0
    if (type === 'swordsman' || type === 'undead') {
      count = 4
    } else if (type === 'vampire' || type === 'bowman') {
      count = 2;
    } else if (type === 'daemon' || type === 'magician') {
      count = 1
    }
    let left = this.calculateLeft(index, count)
    let right = this.calculateRight(index, count)
    let up = this.calculateUp(index, count)
    let down = this.calculateDown(index, count)
    let upRight = this.calculateUpRight(index, count)
    let upLeft = this.calculateUpLeft(index, count)
    let downRight = this.calculateDownRight(index, count)
    let downLeft = this.calculateDownLeft(index, count)
    let allPos = left.concat(right, up, down, upRight, upLeft, downRight, downLeft)
    return allPos
  }

  calculateLeft(index, count) {
    let indexes = [];
    let classNames = ['map-tile-left', 'map-tile-bottom-left', 'map-tile-top-left']
    let cellIndex = this.gamePlay.cells[index];
    let ticks = 0
    for (let i = (index - 1); i >= (index - 4); i--) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        ticks++
      }
    }
    return indexes
  }

  calculateRight(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-right', 'map-tile-bottom-right', 'map-tile-top-right'];
    let ticks = 0
    for (let i = (index + 1); i <= (index + 4); i++) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        ticks++
      }

    }
    return indexes
  }

  calculateUp(index, count, attack = false) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-top-left', 'map-tile-top', 'map-tile-top-right'];
    let ticks = 0;
    for (let i = (index - 8); i >= 0;) {
      if (ticks === count ) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        ticks++
        if (ticks === count && attack === true) {
          indexes.push(i + 1)
          indexes.push(i - 1)
          break
        }
        i = i - 8

      }
    }
    return indexes
  }

  calculateDown(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-bottom-left', 'map-tile-bottom', 'map-tile-bottom-right']
    let ticks = 0;
    for (let i = (index + 8); i <= 63;) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        i = i + 8
        ticks++
      }
    }
    return indexes

  }

  calculateUpRight(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-top-left', 'map-tile-top', 'map-tile-top-right', 'map-tile-right']
    let ticks = 0;
    for (let i = (index - 7); i >= 0;) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        i = i - 7
        ticks++
      }
    }
    return indexes
  }

  calculateUpLeft(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-top-left', 'map-tile-top', 'map-tile-top-right', 'map-tile-left', 'map-tile-bottom-left']
    let ticks = 0;
    for (let i = (index - 9); i >= 0;) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        i = i - 9
        ticks++
      }
    }
    return indexes
  }

  calculateDownRight(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-bottom-left', 'map-tile-bottom', 'map-tile-bottom-right', 'map-tile-right', 'map-tile-bottom-right']
    let ticks = 0;
    for (let i = (index + 9); i <= 63;) {
      if (ticks === count) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        i = i + 9
        ticks++
      }

    }
    return indexes
  }

  calculateDownLeft(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-bottom-left', 'map-tile-bottom', 'map-tile-bottom-right', 'map-tile-left', 'map-tile-bottom-left', 'map-tile-top-left']
    let ticks = 0;
    for (let i = (index + 7); i <= 63;) {
      if (ticks === 4) {
        break
      }
      let cell = this.gamePlay.cells[i];
      if (classNames.some(className => cellIndex.classList.contains(className))) {
        break
      }
      if (classNames.some(className => cell.classList.contains(className))) {
        indexes.push(i);
        break
      } else {
        indexes.push(i);
        i = i + 7
        ticks++
      }
    }
    return indexes
  }

  getToolTip(index) {
    const cell = this.gamePlay.cells[index];
    const char = this.gamePlay.positionedPlayersTeam
    for (const position in char) {
      if (index === char[position]['position']) {
        const types = char[position].character.type
        if ((GameState.selected !== cell) && (types === 'bowman' || types === 'swordsman' || types === 'magician')) {
          this.gamePlay.setCursor('pointer')
        }
        const unicodesPic = ['0x1f396', '0x2694', '0x1f6e1', '0x2764'].map((code) => String.fromCodePoint(code));
        const [level, attack, defense, health] = unicodesPic;
        const message = `${level} ${char[position].character.level} ${attack} ${char[position].character.attack} ${defense} ${char[position].character.defence} ${health}  ${char[position].character.health}`
        this.gamePlay.showCellTooltip(message, index)
        this.gamePlay.addToolTip(cell)

      }
    }
  }

  possibleAttack(index, type) {
    let count = 2
    // let left = this.calculateLeft(index, count)
    // let right = this.calculateRight(index, count)
    let up = this.calculateUp(index, count, true)
    // let down = this.calculateDown(index, count)
    // let upRight = this.calculateUpRight(index, count)
    // let upLeft = this.calculateUpLeft(index, count)
    // let downRight = this.calculateDownRight(index, count)
    // let downLeft = this.calculateDownLeft(index, count)
    // let allPos = left.concat(right, up, down, upRight, upLeft, downRight, downLeft)
    return up
  }
}







