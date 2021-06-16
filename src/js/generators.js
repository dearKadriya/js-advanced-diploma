/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const allowedType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  return new allowedType(maxLevel)
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let team = []
  for(let i = 0; i <= characterCount; i++) {
    team.push(characterGenerator(allowedTypes, maxLevel))
  }
  return team
  // TODO: write logic here
}


