import themes from "./themes";
import {Swordsman, Magician, Bowman} from "./playerCharacters"
import {Undead, Daemon, Vampire} from "./npcCharacters"
import {generateTeam, getTeamWithPosition} from './generators'
import PositionedCharacter from "./PositionedCharacter";
import GamePlay from "./GamePlay";
import Character from "./Character";
import GameState from "./GameState";
import GameStateService from "./GameStateService";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.theme = themes.prairie
    GameState.theme = this.gamePlay.theme
    this.gamePlay.drawUi(themes.prairie);
    const playerTeam = generateTeam([Swordsman, Bowman, Magician], 1, 2);
    const npcTeam = generateTeam([Undead, Daemon, Vampire], 1, 2);
    this.turn('player')
    this.gamePlay.positionedPlayersTeam = getTeamWithPosition(playerTeam, npcTeam);
    this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam);
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index))
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index))
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index))
    this.gamePlay.addNewGameListener(()=> this.newGame())
    this.gamePlay.addSaveGameListener(() => this.saveGame())
    this.gamePlay.addLoadGameListener(() => this.loadGame())
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }


  onCellClick(index) {
    const cell = this.gamePlay.cells[index];
    const char = this.gamePlay.positionedPlayersTeam
    if ((this.gamePlay.possiblePosition) !== undefined && (this.gamePlay.possiblePosition.includes(index))) {
      for (let position in this.gamePlay.positionedPlayersTeam) {
        //так мы определяем что нашли выбранного персонажа из списка
        if (JSON.stringify(this.gamePlay.selectedChar.position) === JSON.stringify(this.gamePlay.positionedPlayersTeam[position].position) && (GameState.selected !== undefined)) {
          this.gamePlay.positionedPlayersTeam[position].position = index
          this.gamePlay.deselectCell(GameState.selected)
          this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
          this.gamePlay.deselectCell(GameState.selected)
          let choosenState = this.gamePlay.cells[GameState.selected]
          this.gamePlay.possiblePosition = undefined
          this.gamePlay.possibleAttack = []
          choosenState.innerHTML = ''
          this.getToolTip(index)
          this.selectedPosition(undefined)
        }
      }
      this.turn('NPC')
      this.NPCTurn()

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
            // console.log(GameState.selected)
          } else {
            this.gamePlay.deselectCell(GameState.selected);
            this.gamePlay.selectCell(index, 'yellow');
            this.selectedPosition(index);
          }
          // console.log(this.gamePlay.selectedChar)

        } else if ((char[position].position === index) && (this.gamePlay.possibleAttack.includes(char[position].position))){
          let target = char[position].character
          this.gamePlay.targetChar = char[position]
          this.gamePlay.showDamage(index, this.gamePlay.selectedChar.character.attack).then(resolve => {
            target.health -= Math.max(this.gamePlay.selectedChar.character.attack - target.defence, this.gamePlay.selectedChar.character.attack * 0.1)
            if (target.health <= 0) {
              for (let position in this.gamePlay.positionedPlayersTeam) {
                if (this.gamePlay.positionedPlayersTeam[position].position === this.gamePlay.targetChar.position) {
                  let indexForDelete = this.gamePlay.positionedPlayersTeam.indexOf(this.gamePlay.positionedPlayersTeam[position])
                  if (indexForDelete > -1) {
                    let cell = this.gamePlay.cells[index]
                    this.gamePlay.deleteToolTip(cell)
                    cell.innerHTML = ''
                    this.gamePlay.positionedPlayersTeam.splice(indexForDelete, 1);
                    // console.log('количество игроков когда бьет игрок ' + this.gamePlay.positionedPlayersTeam)

                  }

                }
              }
            }

            this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
            this.gamePlay.deselectCell(GameState.selected)
            this.selectedPosition(undefined)
            this.checkNewStage()
            this.turn('NPC');
            this.NPCTurn();
          })

        } else {
          this.gamePlay.setCursor('pointer');
          GamePlay.showError('Выбирать можно только своего персонажа!')
        }
        if ((GameState.selected !== undefined)) {
          this.gamePlay.movesWithoutOthers = this.possibleCellForMove(GameState.selected, types);
          let attack = this.possibleAttack(GameState.selected, types)
          for (let position in char) {
            if (this.gamePlay.movesWithoutOthers.includes(char[position].position)) {
              let num = this.gamePlay.movesWithoutOthers.indexOf(char[position].position)
              if (index > -1) {
                this.gamePlay.movesWithoutOthers.splice(num, 1)
              }
            }
          }
          this.gamePlay.possibleAttack = attack
          this.gamePlay.possiblePosition = this.gamePlay.movesWithoutOthers
        }
      }
    }
  }

  onCellEnter(index) {
    const cell = this.gamePlay.cells[index];
    // console.log(index)
    // console.log(cell)
    if ((this.gamePlay.possiblePosition === undefined) || (!this.gamePlay.possiblePosition.includes(index))) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.setCursor('not-allowed')
    } else if ((this.gamePlay.possiblePosition !== undefined) && (this.gamePlay.possiblePosition.includes(index)) && (GameState.selected !== undefined)) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green')
    }

    let NPCTeam = []
    let npcTypes = ['daemon', 'undead', 'vampire']
    const char = this.gamePlay.positionedPlayersTeam
    for (let position in this.gamePlay.positionedPlayersTeam) {
      if (npcTypes.includes(char[position].character.type)) {
        NPCTeam.push(char[position])
      }
    }
    this.gamePlay.NPCTeam = NPCTeam
    for (let position in this.gamePlay.NPCTeam) {
      if ((this.gamePlay.NPCTeam[position].position === index) && (this.gamePlay.possibleAttack.includes(this.gamePlay.NPCTeam[position].position)) && ((GameState.selected !== undefined))) {
        this.gamePlay.setCursor('crosshair')
        this.gamePlay.selectCell(index, 'red')
      }
    }


    this.getToolTip(index)
  }

  onCellLeave(index) {
    const cell = this.gamePlay.cells[index];
    const char = this.gamePlay.positionedPlayersTeam
    for (const position in char) {
      if (index === char[position]['position']) {
        this.gamePlay.hideCellTooltip(index);
        // this.gamePlay.deleteToolTip(cell);
        this.gamePlay.setCursor('auto')
      } else if (index !== GameState.selected) {
        this.gamePlay.deselectCell(index)
      } else if (GameState.selected === undefined) {
        this.gamePlay.deselectCell(index)

      }
    }
  }

  turn(turn) {
    GameState.turn = turn
  }

  selectedPosition(index) {
    GameState.selected = index
  }

  playerScore(integer) {
    GameState.score = integer
  }

  posCharacter(chars) {
    GameState.chars = chars
  }
  theme(theme) {
    GameState.theme = theme
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

  calculateUp(index, count) {
    let cellIndex = this.gamePlay.cells[index];
    let indexes = [];
    let classNames = ['map-tile-top-left', 'map-tile-top', 'map-tile-top-right'];
    let ticks = 0;
    for (let i = (index - 8); i >= 0;) {
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
        if(!cell.querySelectorAll(".toolTip").length > 0) {
          this.gamePlay.addToolTip(cell)

        }
      }
    }
  }

  possibleAttack(index, type) {
    let count = 0
    if (type === 'swordsman' || type === 'undead') {
      count = 1
    } else if (type === 'vampire' || type === 'bowman') {
      count = 2
    } else if (type === 'daemon' || type === 'magician') {
      count = 4
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


  NPCTurn() {
    this.selectedPosition(undefined)
    this.gamePlay.possiblePosition = []
    this.gamePlay.possibleAttack = []
    let NPCChar = []
    let PlayerChar = []
    // console.log('количество игроков когда бьет комп ' + this.gamePlay.positionedPlayersTeam)
    for(let position in this.gamePlay.positionedPlayersTeam) {
      let charType = this.gamePlay.positionedPlayersTeam[position].character.type
      if ( charType === 'undead' || charType === 'daemon' || charType === 'vampire') {
        NPCChar.push(this.gamePlay.positionedPlayersTeam[position])
      } else {
        PlayerChar.push(this.gamePlay.positionedPlayersTeam[position])
      }
    }
    let cancelAttack = false
    for (let position in NPCChar) {
      if(cancelAttack) {
        break
      }
        let attack = this.possibleAttack(NPCChar[position].position, NPCChar[position].character.type)
        for(let playerPos in PlayerChar) {
          if (attack.includes(PlayerChar[playerPos].position)) {
            this.gamePlay.showDamage(PlayerChar[playerPos].position, NPCChar[position].character.attack).then(() => {
              let target = PlayerChar[playerPos].character
              target.health -=Math.max(NPCChar[position].character.attack - target.defence, NPCChar[position].character.attack * 0.1)
              this.turn('player')
              this.gamePlay.deselectCell(PlayerChar[playerPos].position)
              this.selectedPosition(undefined)
              if (target.health <=0) {
                for (let position in this.gamePlay.positionedPlayersTeam) {
                  if (this.gamePlay.positionedPlayersTeam[position].position === PlayerChar[playerPos].position) {
                    let indexForDelete = this.gamePlay.positionedPlayersTeam.indexOf(this.gamePlay.positionedPlayersTeam[position])
                    if (indexForDelete > -1) {
                      let cell = this.gamePlay.cells[PlayerChar[playerPos].position]
                      console.log(cell)
                      this.gamePlay.deleteToolTip(cell)
                      cell.innerHTML = ''
                      this.gamePlay.positionedPlayersTeam.splice(indexForDelete, 1);
                    }

                  }

                }
              }
              this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
              this.checkNewStage()

            })
            cancelAttack = true

            break
          }
        }
    }
    for (let position in NPCChar) {
      let choosenNPC = NPCChar[position]
      if(cancelAttack) {
        break
      }
      let moves = this.possibleCellForMove(NPCChar[position].position, NPCChar[position].character.type)
      for(let playerPos in PlayerChar) {
        if(cancelAttack) {
          break
        }
        let pos = PlayerChar[playerPos].position
        let closest = moves.reduce(function (prev, curr) {
          return (Math.abs(curr - pos) < Math.abs(prev - pos) ? curr : prev);
        })
        // console.log("возможные позиции для ходов " + moves)
        // console.log("позиция игрока " + PlayerChar[playerPos].position)
        // console.log("ближайшая позиция " + closest)
        for (let position in this.gamePlay.positionedPlayersTeam) {
          if (this.gamePlay.positionedPlayersTeam[position].position === choosenNPC.position) {
            // console.log('позиция чузена ' + choosenNPC.position)
            let cell = this.gamePlay.cells[choosenNPC.position]
            cell.innerHTML = ''
            this.gamePlay.positionedPlayersTeam[position].position = closest
            this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
            this.turn('player')
            cancelAttack = true
            break
          }
        }
      }
    }
  }
  checkNewStage() {
    let NPCTeamTypes = ['undead', 'daemon', 'vampire']
    let PlayerTypes = ['bowman', 'swordsman', 'magician']
    let PlayerChars = []
    let actualTypes = []
    for (let character in this.gamePlay.positionedPlayersTeam) {
      actualTypes.push(this.gamePlay.positionedPlayersTeam[character].character.type)
      PlayerChars.push(this.gamePlay.positionedPlayersTeam[character].character)
    }
    let someLeftNPC = NPCTeamTypes.some(r => actualTypes.indexOf(r) >= 0)
    let someLeftPlayer = PlayerTypes.some(r => actualTypes.indexOf(r) >=0)
    console.log(someLeftPlayer)
    console.log(actualTypes)
    let score = 0;
    if (!someLeftPlayer) {
      this.disableAll()

    }
    if (!someLeftNPC && someLeftPlayer) {
      for (let character in PlayerChars) {
        score += PlayerChars[character].health
      }
      let countOfPlayerChar = 0
      for (let character in this.gamePlay.positionedPlayersTeam) {
        this.levelUp(this.gamePlay.positionedPlayersTeam[character])
        countOfPlayerChar += 1
      }
      this.playerScore(score)
      this.goToNewLvl(this.gamePlay.theme, countOfPlayerChar)
      this.gamePlay.redrawPositions(this.gamePlay.positionedPlayersTeam)
    }

  }
  levelUp(Character) {
    Character.character.level += 1
    Character.character.attack = Math.max(Character.character.attack, Character.character.attack * (1.8 - Character.character.health) / 100)
    Character.character.health = Character.character.health + 80
    if (Character.character.health > 100) {
      Character.character.health = 100
    }
    // console.log(Character)
  }
  goToNewLvl(currentTheme, playerChar) {
    let extraChar = 0
    let npcCharLVL = 0
    let playerCharLvl = 0
    switch (currentTheme) {
      case themes.prairie:
        this.gamePlay.drawUi(themes.desert)
        this.gamePlay.theme = themes.desert
        extraChar = 1
        playerCharLvl = 1
        npcCharLVL = 2
        break;
      case themes.desert:
        this.gamePlay.drawUi(themes.arctic)
        this.gamePlay.theme = themes.arctic
        playerCharLvl = 2
        npcCharLVL = 3
        extraChar = 2
        break;
      case themes.arctic:
        this.gamePlay.drawUi(themes.mountain)
        this.gamePlay.theme = themes.mountain
        playerCharLvl = 3
        npcCharLVL = 4
        extraChar = 2
        break;
      case themes.mountain:
        alert('Победа! Ваши очки: ' + GameState.score)
        this.gamePlay.setCursor('not-allowed')
        let elements = document.getElementsByClassName('character')
        while (elements.length > 0) {
          elements[0].parentNode.removeChild(elements[0])
        }
        playerCharLvl = 0
        npcCharLVL = 0
        extraChar = 0
        playerChar = 0
        break
    }
    GameState.theme = this.gamePlay.theme
    let npcExtraTeam = extraChar + playerChar
    const playerTeam = generateTeam([Swordsman, Bowman, Magician], playerChar, extraChar)
    const npcTeam = generateTeam([Undead, Daemon, Vampire], npcCharLVL, npcExtraTeam);
    let oldTeamWithPosition = this.gamePlay.positionedPlayersTeam
    let newTeamWithPosition = getTeamWithPosition(playerTeam, npcTeam)
    this.gamePlay.positionedPlayersTeam = oldTeamWithPosition.concat(newTeamWithPosition)
    }
  disableAll() {


}
 newGame() {
   this.init()
 }
  saveGame() {
    this.posCharacter(this.gamePlay.positionedPlayersTeam)
    let state = {}
    GameState.from(state)
    let charSave = new GameStateService(localStorage)
    charSave.save(state)

  }
  loadGame() {
    let load = new GameStateService(localStorage)
    let jsonForUnpack = load.load()
    let chars = jsonForUnpack['chars']
    GameState.score = jsonForUnpack['score']
    this.turn(jsonForUnpack['turn'])
    this.selectedPosition(jsonForUnpack['selected'])
    let elements = document.getElementsByClassName('character')
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0])
    }
    this.gamePlay.theme = jsonForUnpack['theme']
    this.gamePlay.drawUi(jsonForUnpack['theme'])
    this.gamePlay.positionedPlayersTeam = chars
    console.log(this.gamePlay.positionedPlayersTeam)
    this.gamePlay.setCursor('auto');
    this.selectedPosition(undefined)
    this.gamePlay.possiblePosition = []
    this.gamePlay.possibleAttack = []
    this.gamePlay.redrawPositions(chars)

  }
}


