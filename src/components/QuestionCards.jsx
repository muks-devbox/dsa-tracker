import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass } from '@/lib/srs';

export default function QuestionCards({ questions, groups, onView, onEdit, onDelete, onMarkRevised }) {
  const renderCard = (q) => {
    const due = isDue(q.lastRevised, q.confidence);
    const nextDate = getNextRevisionDate(q.lastRevised, q.confidence);
    const tags = q.tags || [];
    return (
      <div
        key={q.id}
        className={`border border-border rounded-md p-4 bg-card ${
          due ? 'bg-primary/5' : q.confidence <= 2 ? 'bg-destructive/5' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <button onClick={() => onView(q)} className="text-left">
            <div className="font-semibold hover:text-primary transition-colors">{q.name}</div>
            <div className="text-muted-foreground text-xs">{q.platform}</div>
          </button>
          <div className="flex gap-3">
            <button onClick={() => onEdit(q)} className="text-muted-foreground">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(q)} className="text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
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

        <div className="flex items-center justify-between text-sm">
          <span className={`font-mono font-bold ${confidenceColorClass(q.confidence)}`}>
            Lv {q.confidence}
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs ${due ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
              {nextDate}
            </span>
            {due && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                DUE
              </span>
            )}
          </div>
        </div>

        {due && (
          <button
            onClick={() => onMarkRevised(q)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Revised
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="md:hidden space-y-3">
      {groups
        ? groups.map((group, i) => (
            <div key={group.tag} className={i > 0 ? 'pt-2' : ''}>
              <div className="bg-primary/15 rounded-md px-3 py-2.5 mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                {group.tag}
                <span className="ml-2 font-normal normal-case text-muted-foreground">
                  {group.items.length} problem{group.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">{group.items.map(renderCard)}</div>
            </div>
          ))
        : questions.map(renderCard)}
    </div>
  );
}
