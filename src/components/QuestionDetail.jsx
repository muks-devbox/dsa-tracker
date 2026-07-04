import { X, Pencil, CheckCircle2 } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass, CONFIDENCE_LABELS } from '@/lib/srs';

export default function QuestionDetail({ open, question, onClose, onEdit, onMarkRevised }) {
  if (!open || !question) return null;

  const due = isDue(question.lastRevised, question.confidence);
  const nextDate = getNextRevisionDate(question.lastRevised, question.confidence);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card h-full overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div>
            <h2 className="font-semibold text-xl leading-tight">{question.name}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{question.platform}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {(question.tags || []).map((t) => (
            <span key={t} className="border border-border px-2 py-0.5 rounded-md text-xs">
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <InfoBlock label="Confidence">
            <span className={`font-mono font-bold text-lg ${confidenceColorClass(question.confidence)}`}>
              Lv {question.confidence}
            </span>
            <span className="text-muted-foreground text-xs ml-1.5">
              {CONFIDENCE_LABELS[question.confidence]}
            </span>
          </InfoBlock>
          <InfoBlock label="Time Complexity">
            <span className="font-mono text-sm">{question.timeComplexity || '—'}</span>
          </InfoBlock>
          <InfoBlock label="Last Revised">
            <span className="font-mono text-sm">{question.lastRevised}</span>
          </InfoBlock>
          <InfoBlock label="Next Revision">
            <span className={`font-mono text-sm ${due ? 'text-primary font-bold' : ''}`}>
              {nextDate}
            </span>
            {due && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                DUE
              </span>
            )}
          </InfoBlock>
        </div>

        <Section label="Approach / Logic" content={question.approach} />
        <Section label="Mistakes / Watch-outs" content={question.mistakeNotes} highlight />

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onEdit(question)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          {due && (
            <button
              onClick={() => onMarkRevised(question)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Revised
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Section({ label, content, highlight = false }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </div>
      <div
        className={`text-sm whitespace-pre-wrap rounded-md border p-3 min-h-[3rem] ${
          highlight ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-background'
        } ${!content ? 'text-muted-foreground italic' : ''}`}
      >
        {content || 'Nothing noted.'}
      </div>
    </div>
  );
}
