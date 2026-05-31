import { describe, expect, it } from 'vitest';

import {
  normalizeParticipantInput,
  parseParticipantInput,
  removeWinnerFromInput,
  splitParticipantInput,
} from './participants';
import { parseName } from './utils';

describe('parseName', () => {
  it('parses plain names with default weight and count', () => {
    expect(parseName('Alice')).toEqual({
      name: 'Alice',
      weight: 1,
      count: 1,
    });
  });

  it('parses weight and count modifiers in either order', () => {
    expect(parseName('Alice/3*2')).toEqual({
      name: 'Alice',
      weight: 3,
      count: 2,
    });
    expect(parseName('Bob*4/5')).toEqual({
      name: 'Bob',
      weight: 5,
      count: 4,
    });
  });

  it('rejects malformed, unsafe, or excessive entries', () => {
    expect(parseName('')).toBeNull();
    expect(parseName('/2')).toBeNull();
    expect(parseName('Alice/0')).toBeNull();
    expect(parseName('Alice*0')).toBeNull();
    expect(parseName('Alice/-1')).toBeNull();
    expect(parseName('Alice/abc')).toBeNull();
    expect(parseName('Alice/2/3')).toBeNull();
    expect(parseName('Alice<script>')).toBeNull();
    expect(parseName(`Alice${String.fromCharCode(7)}`)).toBeNull();
    expect(parseName(`A${'a'.repeat(80)}`)).toBeNull();
    expect(parseName('Alice/1001')).toBeNull();
    expect(parseName('Alice*1001')).toBeNull();
  });
});

describe('participant input helpers', () => {
  it('splits comma and newline separated input', () => {
    expect(splitParticipantInput('Alice, Bob\nCharlie\r\nDana')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'Dana',
    ]);
  });

  it('returns parsed entries, invalid tokens, and total participant count', () => {
    expect(parseParticipantInput('Alice, Bob*3, Broken/0')).toEqual({
      entries: [
        {
          name: 'Alice',
          weight: 1,
          count: 1,
          key: 'Alice::1',
        },
        {
          name: 'Bob',
          weight: 1,
          count: 3,
          key: 'Bob::1',
        },
      ],
      invalidTokens: ['Broken/0'],
      totalParticipants: 4,
    });
  });

  it('normalizes duplicate entries without merging different weights', () => {
    expect(normalizeParticipantInput('Alice, Bob*2, Alice/2, Alice')).toBe(
      'Alice*2, Bob*2, Alice/2',
    );
  });

  it('removes a winner while preserving remaining weighted entries', () => {
    expect(removeWinnerFromInput('Alice/3*2, Bob', 'Alice')).toEqual({
      value: 'Alice/3, Bob',
      removed: true,
    });
    expect(removeWinnerFromInput('Alice/3, Bob', 'Alice')).toEqual({
      value: 'Bob',
      removed: true,
    });
    expect(removeWinnerFromInput('Alice, Bob', 'Charlie')).toEqual({
      value: 'Alice, Bob',
      removed: false,
    });
  });
});
