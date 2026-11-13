import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStars, distance, isCandyReached, isPointInBox, SKINS } from './logic';

test('calculateStars awards 3 stars when under or equal to threshold 3', () => {
  assert.equal(calculateStars(1, 3, 6), 3);
  assert.equal(calculateStars(3, 3, 6), 3);
});

test('calculateStars awards 2 stars between thresholds', () => {
  assert.equal(calculateStars(4, 3, 6), 2);
  assert.equal(calculateStars(6, 3, 6), 2);
});

test('calculateStars awards 1 star when exceeding threshold 2', () => {
  assert.equal(calculateStars(7, 3, 6), 1);
  assert.equal(calculateStars(20, 3, 6), 1);
});

test('distance calculates Euclidean distance correctly', () => {
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.equal(distance({ x: 10, y: 20 }, { x: 10, y: 20 }), 0);
});

test('isCandyReached triggers within threshold radius', () => {
  assert.equal(isCandyReached({ x: 100, y: 100 }, { x: 130, y: 100 }, 32, 24), true);
  assert.equal(isCandyReached({ x: 100, y: 100 }, { x: 250, y: 100 }, 32, 24), false);
});

test('isPointInBox correctly tests bounds', () => {
  const box = { x: 200, y: 200, width: 100, height: 60 };
  assert.equal(isPointInBox({ x: 200, y: 200 }, box), true);
  assert.equal(isPointInBox({ x: 240, y: 220 }, box), true);
  assert.equal(isPointInBox({ x: 260, y: 200 }, box), false);
});

test('skins define valid gradients and colors', () => {
  assert.ok(SKINS.purple);
  assert.equal(SKINS.purple.bodyGradient.length, 3);
  assert.ok(SKINS.purple.highlightColor.startsWith('#'));
});
