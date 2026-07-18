const DAY = 864e5;
const MIN_LEN = 21;
const MAX_LEN = 35;

export interface CycleInfo {
  day: number;
  len: number;
  predicted: boolean;
}

export interface ContentInfo {
  key: 'mens' | 'foli' | 'ovul' | 'lute';
  phase: any;
  stage: any;
  feels: Array<[string, string]>;
  from: number;
  to: number;
}

export interface PhaseBounds {
  mens: [number, number];
  foli: [number, number];
  ovul: [number, number];
  lute: [number, number];
}

const ORDER = ['mens', 'foli', 'ovul', 'lute'] as const;

function bounds(len: number): PhaseBounds {
  const ovul = Math.max(8, len - 14);
  return {
    mens: [1, 5],
    foli: [6, ovul - 2],
    ovul: [ovul - 1, ovul + 1],
    lute: [ovul + 2, len],
  };
}

function phaseOf(day: number, len: number): 'mens' | 'foli' | 'ovul' | 'lute' {
  const b = bounds(len);
  return (
    (ORDER.find((k) => day >= b[k][0] && day <= b[k][1]) as any) || 'lute'
  );
}

export function intervals(starts: Date[]): number[] {
  const s = [...starts].sort((a, b) => a.getTime() - b.getTime());
  const out: number[] = [];
  for (let i = 1; i < s.length; i++) {
    out.push(Math.round((s[i].getTime() - s[i - 1].getTime()) / DAY));
  }
  return out;
}

export function avgLen(starts: Date[]): number {
  const usable = intervals(starts)
    .filter((n) => n >= MIN_LEN && n <= MAX_LEN)
    .slice(-6);
  if (!usable.length) return 28;
  return Math.round(usable.reduce((a, b) => a + b, 0) / usable.length);
}

function mid(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

export function cycleAt(
  date: Date,
  starts: Date[],
  now: Date = new Date()
): CycleInfo {
  const s = [...starts].sort((a, b) => a.getTime() - b.getTime());
  const t = mid(date);
  const L = avgLen(starts);

  for (let i = s.length - 1; i >= 0; i--) {
    const st = mid(s[i]);
    if (t >= st) {
      const next = s[i + 1] ? mid(s[i + 1]) : null;
      if (next && t < next) {
        return {
          day: Math.round((t - st) / DAY) + 1,
          len: Math.round((next - st) / DAY),
          predicted: false,
        };
      }
      if (!next) {
        const off = Math.round((t - st) / DAY);
        return {
          day: (off % L) + 1,
          len: L,
          predicted: t > mid(now),
        };
      }
    }
  }

  const st = mid(s[0]);
  const off = Math.round((t - st) / DAY);
  return {
    day: (((off % L) + L) % L) + 1,
    len: L,
    predicted: true,
  };
}

export function contentFor(
  day: number,
  len: number,
  PHASES: any,
  FEELS: any
): ContentInfo {
  const key = phaseOf(day, len);
  const p = PHASES[key];
  const b = bounds(len)[key];
  const span = Math.max(1, b[1] - b[0] + 1);
  const prog = (day - b[0]) / span;
  const idx = Math.min(
    p.stages.length - 1,
    Math.max(0, Math.floor(prog * p.stages.length))
  );
  const feels = (FEELS[key] && FEELS[key][idx]) || p.feels;
  return {
    key,
    phase: p,
    stage: p.stages[idx],
    feels,
    from: b[0],
    to: b[1],
  };
}

export function isOutlier(n: number): boolean {
  return n < MIN_LEN || n > MAX_LEN;
}

export function isStart(date: Date, starts: Date[]): boolean {
  return starts.some((s) => mid(s) === mid(date));
}
