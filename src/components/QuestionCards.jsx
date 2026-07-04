import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass } from '@/lib/srs';

export default function QuestionCards({ questions, onView, onEdit, onDelete, onMarkRevised }) {
  return (
    <div className="md:hidden space-y-3">
      {questions.map((q) => {
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
      })}
    </div>
  );
}
