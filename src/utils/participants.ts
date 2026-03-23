import { parseName } from './utils';

export type ParticipantEntry = {
  name: string;
  weight: number;
  count: number;
  key: string;
};

export type ParsedParticipants = {
  entries: ParticipantEntry[];
  invalidTokens: string[];
  totalParticipants: number;
};

export function splitParticipantInput(value: string): string[] {
  return value
    .split(/[,\r\n]/g)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function formatParticipantEntry(entry: ParticipantEntry): string {
  const weight = entry.weight > 1 ? `/${entry.weight}` : '';
  const count = entry.count > 1 ? `*${entry.count}` : '';
  return `${entry.name}${weight}${count}`;
}

export function parseParticipantInput(value: string): ParsedParticipants {
  const tokens = splitParticipantInput(value);
  const entries: ParticipantEntry[] = [];
  const invalidTokens: string[] = [];
  let totalParticipants = 0;

  tokens.forEach((token) => {
    const parsed = parseName(token);
    if (!parsed) {
      invalidTokens.push(token);
      return;
    }

    const entry: ParticipantEntry = {
      ...parsed,
      key: `${parsed.name}::${parsed.weight}`,
    };
    entries.push(entry);
    totalParticipants += parsed.count;
  });

  return {
    entries,
    invalidTokens,
    totalParticipants,
  };
}

export function normalizeParticipantInput(value: string): string {
  const parsed = parseParticipantInput(value);
  const grouped = new Map<string, ParticipantEntry>();

  parsed.entries.forEach((entry) => {
    const existing = grouped.get(entry.key);
    if (existing) {
      existing.count += entry.count;
      return;
    }
    grouped.set(entry.key, { ...entry });
  });

  return Array.from(grouped.values()).map(formatParticipantEntry).join(', ');
}

export function removeWinnerFromInput(
  value: string,
  winnerName: string,
): { value: string; removed: boolean } {
  const parsed = parseParticipantInput(value);
  let removed = false;

  const nextEntries = parsed.entries.reduce<ParticipantEntry[]>((acc, entry) => {
    if (!removed && entry.name === winnerName) {
      removed = true;
      if (entry.count > 1) {
        acc.push({ ...entry, count: entry.count - 1 });
      }
      return acc;
    }

    acc.push(entry);
    return acc;
  }, []);

  return {
    value: nextEntries.map(formatParticipantEntry).join(', '),
    removed,
  };
}
