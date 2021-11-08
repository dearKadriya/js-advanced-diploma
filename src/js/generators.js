import {Bowman, Magician, Swordsman} from "./playerCharacters";
import {Daemon, Undead, Vampire} from "./npcCharacters";
import PositionedCharacter from "./PositionedCharacter";


/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const allowedType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  let type = ''
  if (allowedType === Swordsman) {
    type = 'swordsman'
  } else if (allowedType === Bowman) {
    type = 'bowman'
  } else if (allowedType === Magician) {
    type = 'magician'
  } else if (allowedType === Undead) {
    type = 'undead'
  } else if (allowedType === Daemon) {
    type = 'daemon'
  } else if (allowedType === Vampire) {
    type = 'vampire'
  }
  let level = Math.floor((Math.random() * maxLevel) + 1)
  yield new allowedType(level, type);

}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let team = [];
  for(let i = 0; i < characterCount; i++) {
    let generator = characterGenerator(allowedTypes, maxLevel)
    team.push(generator.next().value)
  }
  return team
  // TODO: write logic here
}


export function getTeamWithPosition(playerTeam, npcTeam) {
  let charAtPos = [];
  let possiblePositionPlayer = []
  let board = 56
  for(let i = 0; i <= board; i++) {
    possiblePositionPlayer.push(i)
    i = i + 7
  }
  board = 57
  for(let i = 1; i <= board; i++) {
    possiblePositionPlayer.push(i)
    i = i + 7
  }
  board = 62
  let possiblePositionNPC = []
  for(let i = 6; i <= board; i++) {
    possiblePositionNPC.push(i)
    i = i + 7
  }
  board = 63
  for(let i = 7; i <= board; i++) {
    possiblePositionNPC.push(i)
    i = i + 7
  }

  for(let char of playerTeam) {
    charAtPos.push(new PositionedCharacter(char, possiblePositionPlayer[Math.floor(Math.random() * possiblePositionPlayer.length)]));
  }
  for(let char of npcTeam) {
    charAtPos.push(new PositionedCharacter(char, possiblePositionNPC[Math.floor(Math.random() * possiblePositionPlayer.length)]));
  }
  return charAtPos
}



