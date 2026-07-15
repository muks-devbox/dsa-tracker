import { Fragment } from 'react';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass } from '@/lib/srs';

export default function QuestionTable({ questions, groups, onView, onEdit, onDelete, onMarkRevised }) {
  const renderRow = (q) => {
    const due = isDue(q.lastRevised, q.confidence);
    const nextDate = getNextRevisionDate(q.lastRevised, q.confidence);
    const tags = q.tags || [];
    return (
      <tr
        key={q.id}
        className={`border-b border-border last:border-0 ${
          due ? 'bg-primary/5' : q.confidence <= 2 ? 'bg-destructive/5' : ''
        }`}
      >
        <td className="px-5 py-4">
          <button
            onClick={() => onView(q)}
            className="text-left font-semibold hover:text-primary hover:underline transition-colors"
          >
            {q.name}
          </button>
          <div className="text-muted-foreground text-xs">{q.platform}</div>
        </td>
        <td className="px-5 py-4">
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="border border-border px-2 py-0.5 rounded-md text-xs">
                {t}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground px-1">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-4">
          <span className={`font-mono font-bold ${confidenceColorClass(q.confidence)}`}>
            Lv {q.confidence}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={`font-mono ${due ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
              {nextDate}
            </span>
            {due && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                DUE
              </span>
            )}
          </div>
          {due && (
            <button
              onClick={() => onMarkRevised(q)}
              className="mt-1.5 flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-md hover:bg-primary/20 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Revised
            </button>
          )}
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-end gap-3">
            <button onClick={() => onEdit(q)} className="text-muted-foreground hover:text-foreground" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(q)} className="text-muted-foreground hover:text-destructive" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="hidden md:block border border-border rounded-md overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-20 bg-card">
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-medium">Problem</th>
            <th className="px-5 py-3 font-medium">Tags</th>
            <th className="px-5 py-3 font-medium">Confidence</th>
            <th className="px-5 py-3 font-medium">Next Rev</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups
            ? groups.map((group, i) => (
                <Fragment key={group.tag}>
                  <tr className={`bg-primary/15 ${i > 0 ? 'border-t-2 border-t-primary/30' : ''}`}>
                    <td colSpan={5} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary">
                      {group.tag}
                      <span className="ml-2 font-normal normal-case text-muted-foreground">
                        {group.items.length} problem{group.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                  {group.items.map(renderRow)}
                </Fragment>
              ))
            : questions.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
