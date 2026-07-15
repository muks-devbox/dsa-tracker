import { getNextRevisionDate } from './srs';

function escapeCsvField(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportQuestionsToCSV(questions) {
  const headers = [
    'Name',
    'Platform',
    'Problem Link',
    'Tags',
    'Confidence',
    'Gist',
    'Last Revised',
    'Next Revision',
    'Time Complexity',
    'Approach',
    'Mistake Notes',
  ];

  const rows = questions.map((q) => [
    q.name,
    q.platform,
    q.problemLink,
    (q.tags || []).join(', '),
    q.confidence,
    q.gist,
    q.lastRevised,
    getNextRevisionDate(q.lastRevised, q.confidence),
    q.timeComplexity,
    q.approach,
    q.mistakeNotes,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvField).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `dsa-tracker-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
