import Character from "../Character";

test("Проверка ошибки при попытке создать объект класса Character", ()=> {
  expect(() => {new Character()}).toThrowError('Нельзя создавать объект такого класса!')
});

test('Проверка отсутствия ошибок при создании класса наследника', ()=> {
    class Daemon extends Character {}
    const result = new Daemon(1);
    expect(result).toEqual({"attack": 0, "defence": 0, "health": 50, "level": 1, "type": "generic"}
    )
})
