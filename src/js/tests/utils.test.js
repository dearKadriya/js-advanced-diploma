import {calcTileType} from "../utils";

test.each([
  [0, 8, 'top-left'],
  [7, 8, 'top-right'],
  [4, 8, 'top'],
  [63, 8, 'bottom-right'],
  [56, 8, 'bottom-left'],
  [16, 8, 'left'],
  [15, 8, 'right'],
  [9, 8, 'center'],
  [62, 8, 'bottom']
])(
  ('Проверка значений для отрисовки поля'),
  (index, boardSize, expecting) => {
    const result = calcTileType(index, boardSize);
    expect(expecting).toBe(result);
  }
)
