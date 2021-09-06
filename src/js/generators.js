/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const allowedType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const type = allowedType.name.toString().toLowerCase()
  let level = Math.floor((Math.random() * maxLevel) + 1)
  console.log(type)
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


