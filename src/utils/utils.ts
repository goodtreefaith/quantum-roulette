export function rad(degree: number) {
  return (Math.PI * degree) / 180;
}

const MAX_NAME_LENGTH = 80;
const MAX_ENTRY_NUMBER = 1000;

export type ParsedName = {
  name: string;
  weight: number;
  count: number;
};

function parsePositiveEntryNumber(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > MAX_ENTRY_NUMBER) {
    return null;
  }

  return parsed;
}

export function parseName(nameStr: string): ParsedName | null {
  const input = nameStr.trim();
  if (!input || /[<>\x00-\x1F\x7F]/.test(input)) {
    return null;
  }

  const nameMatch = /^([^/*]+)/.exec(input);
  const name = nameMatch?.[1].trim() ?? '';
  if (!name || name.length > MAX_NAME_LENGTH) {
    return null;
  }

  let modifiers = input.slice(nameMatch?.[0].length ?? 0);
  let weight = 1;
  let count = 1;
  let hasWeight = false;
  let hasCount = false;

  while (modifiers.length > 0) {
    const weightMatch = /^\/([^/*]+)/.exec(modifiers);
    if (weightMatch) {
      if (hasWeight) {
        return null;
      }
      const parsedWeight = parsePositiveEntryNumber(weightMatch[1]);
      if (!parsedWeight) {
        return null;
      }
      weight = parsedWeight;
      hasWeight = true;
      modifiers = modifiers.slice(weightMatch[0].length);
      continue;
    }

    const countMatch = /^\*([^/*]+)/.exec(modifiers);
    if (countMatch) {
      if (hasCount) {
        return null;
      }
      const parsedCount = parsePositiveEntryNumber(countMatch[1]);
      if (!parsedCount) {
        return null;
      }
      count = parsedCount;
      hasCount = true;
      modifiers = modifiers.slice(countMatch[0].length);
      continue;
    }

    return null;
  }

  return {
    name,
    weight,
    count,
  };
}

export function pad(v: number) {
  return v.toString().padStart(2, '0');
}
