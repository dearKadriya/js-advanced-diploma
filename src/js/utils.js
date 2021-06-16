export function calcTileType(index, boardSize) {
  const cellsOnBoard = boardSize * boardSize;
  switch (true) {
    case index === 0:
      return 'top-left'
    case ((index + 1) === boardSize):
      return 'top-right'
    case index < boardSize:
      return 'top'
    case ((index + 1) === cellsOnBoard):
        return 'bottom-right'
    case (index === (cellsOnBoard - boardSize)):
      return 'bottom-left'
    case ((index % boardSize) === 0):
      return 'left'
    case ((index + 1) % boardSize === 0):
      return 'right'
    case (index > (cellsOnBoard - boardSize)):
      return 'bottom'
    default:
      return 'center'
  }
  // TODO: write logic here
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
