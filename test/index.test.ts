import { OrgbColor } from '../src';

test('', () => {
  const color = new OrgbColor(0xff0000);
  expect(color.r).toBe(255);
  expect(color.g).toBe(0);
});
