export const shift = {
  x: 0,
  y: 0,
};

export function moveCameraToHamster(hamster, shift) {
  const dx = -hamster.x + 200 - shift.x;
  const dy = -hamster.y + 300 - shift.y;
  shift.x += dx / 10;
  // shift.y += dy / 100;
}
