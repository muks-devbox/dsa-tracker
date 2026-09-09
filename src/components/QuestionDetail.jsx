import { X, Pencil, CheckCircle2, ExternalLink } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass, CONFIDENCE_LABELS } from '@/lib/srs';
import { renderMarkdownLite } from '@/lib/markdown';
import { celebrateRevision } from '@/lib/confetti';

export default function QuestionDetail({ open, question, onClose, onEdit, onMarkRevised }) {
  if (!open || !question) return null;

  const due = isDue(question.lastRevised, question.confidence);
  const nextDate = getNextRevisionDate(question.lastRevised, question.confidence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-backdrop-in" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-md w-full max-w-2xl max-h-[90vh] shadow-xl animate-modal-in flex flex-col">
        {/* Sticky header */}
        <div className="shrink-0 px-8 pt-6 pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-display text-2xl font-extrabold text-primary tracking-tight pr-8">
            {question.name}
          </h2>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-1.5">
            <p className="font-mono text-sm text-muted-foreground">
              {question.platform} • Level {question.confidence} —{' '}
              <span className={confidenceColorClass(question.confidence)}>
                {CONFIDENCE_LABELS[question.confidence]}
              </span>
            </p>
            {question.problemLink && (
              <a
                href={question.problemLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View Problem <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {(question.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {question.tags.map((t) => (
                <span key={t} className="border border-border px-2 py-0.5 rounded-md text-xs">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5">
          {question.gist && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
              <div className="text-[11px] uppercase tracking-wide text-primary/80 mb-1.5 font-medium">
                What's the problem asking?
              </div>
              <div
                className="md-content text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdownLite(question.gist) }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-x-8 gap-y-3 pb-5 border-b border-border">
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

          <Box label="Time Complexity" mono>
            {question.timeComplexity || '—'}
          </Box>

          <Section label="Approach" content={question.approach} />
          <Section label="Mistakes / Notes" content={question.mistakeNotes} highlight />
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 flex gap-3 px-8 py-5 border-t border-border">
          <button
            onClick={() => onEdit(question)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] active:scale-[0.98] transition-all"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          {due && (
            <button
              onClick={(e) => {
                celebrateRevision(e);
                onMarkRevised(question);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
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

function Box({ label, children, mono = false }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className={`text-sm rounded-md border border-border bg-background p-3 ${mono ? 'font-mono' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function Section({ label, content, highlight = false }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </div>
      <div
        className={`text-sm rounded-md border p-3 min-h-[3rem] md-content ${
          highlight ? 'border-destructive/30 bg-destructive/5 md-destructive' : 'border-border bg-background'
        } ${!content ? 'text-muted-foreground italic' : ''}`}
        dangerouslySetInnerHTML={{
          __html: content ? renderMarkdownLite(content) : 'Nothing noted.',
        }}
      />
    </div>
  );
}
