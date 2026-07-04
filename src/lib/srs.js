// Spaced repetition offset table: confidence level -> days until next revision
export const OFFSET_DAYS = {
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};

export const CONFIDENCE_LABELS = {
  1: 'Blackout',
  2: 'Weak',
  3: 'Ok',
  4: 'Strong',
  5: 'Mastered',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Adds `days` to an ISO date string (YYYY-MM-DD), returns ISO date string
export function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getNextRevisionDate(lastRevised, confidence) {
  const offset = OFFSET_DAYS[confidence] ?? 5;
  return addDays(lastRevised, offset);
}

export function isDue(lastRevised, confidence) {
  const nextDate = getNextRevisionDate(lastRevised, confidence);
  return nextDate <= todayISO();
}

export function getToday() {
  return todayISO();
}

export function confidenceColorClass(confidence) {
  if (confidence <= 2) return 'text-destructive';
  if (confidence === 3) return 'text-amber-600';
  return 'text-emerald-600';
}
