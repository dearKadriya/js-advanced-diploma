export default class GameState {
  static from(object) {
    this.turn = object.turn
    this.selected = object.selecting
    return null;
  }
}
