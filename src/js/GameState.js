export default class GameState {

  static from(object) {
    object.chars = GameState.chars
    object.turn = GameState.turn
    object.selected = GameState.selected
    object.score = GameState.score
    object.theme = GameState.theme
    return object
  }

}
