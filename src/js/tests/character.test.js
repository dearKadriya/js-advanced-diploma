import Character from "../Character";

test("Проверка ошибки при попытке создать объект класса Character", ()=> {
  expect(() => {new Character()}).toThrowError('Нельзя создавать объект такого класса!')
})
