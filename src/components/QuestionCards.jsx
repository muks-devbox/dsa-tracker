import { Pencil, Trash2, CheckCircle2, BookOpen, Book, ChevronRight } from 'lucide-react';
import { getNextRevisionDate, isDue, confidenceColorClass } from '@/lib/srs';
import { celebrateRevision } from '@/lib/confetti';

export default function QuestionCards({
  questions,
  groups,
  notesByTag,
  onOpenNote,
  collapsedGroups,
  onToggleGroup,
  onView,
  onEdit,
  onDelete,
  onMarkRevised,
}) {
  const renderCard = (q, idx = 0) => {
    const due = isDue(q.lastRevised, q.confidence);
    const nextDate = getNextRevisionDate(q.lastRevised, q.confidence);
    const tags = q.tags || [];
    return (
      <div
        key={q.id}
        style={{ animationDelay: `${Math.min(idx, 10) * 35}ms` }}
        className={`border border-border rounded-md p-4 bg-card animate-row-in hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow] ${
          due ? 'bg-primary/5' : q.confidence <= 2 ? 'bg-destructive/5' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <button onClick={() => onView(q)} className="text-left">
            <div className="font-semibold hover:text-primary transition-colors">{q.name}</div>
            <div className="text-muted-foreground text-xs">{q.platform}</div>
          </button>
          <div className="flex gap-3">
            <button onClick={() => onEdit(q)} className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-transform">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(q)} className="text-muted-foreground hover:text-destructive hover:scale-110 active:scale-95 transition-transform">
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
            onClick={(e) => {
              celebrateRevision(e);
              onMarkRevised(q);
            }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-md hover:opacity-90 active:scale-[0.97] transition-all"
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
        ? groups.map((group, i) => {
            const collapsed = collapsedGroups?.has(group.tag);
            const dueCount = group.items.filter((q) => isDue(q.lastRevised, q.confidence)).length;
            return (
              <div key={group.tag} className={i > 0 ? 'pt-2' : ''}>
                <div
                  className={`rounded-md px-3 py-2.5 mb-3 flex items-center justify-between gap-2 transition-colors duration-300 ${
                    collapsed && dueCount === 0 ? 'bg-black/[0.03]' : 'bg-primary/15'
                  }`}
                >
                  <button
                    onClick={() => onToggleGroup(group.tag)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary flex-1 text-left min-w-0 active:opacity-60 transition-opacity"
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        collapsed ? '' : 'rotate-90'
                      }`}
                    />
                    <span className="truncate">{group.tag}</span>
                    <span className="font-normal normal-case text-muted-foreground shrink-0">
                      {group.items.length}
                    </span>
                    {dueCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md normal-case animate-pulse shrink-0">
                        {dueCount} due
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onOpenNote(group.tag)}
                    title={notesByTag?.[group.tag] ? 'View pattern notes' : 'Add pattern notes'}
                    className={`flex items-center gap-1 text-xs font-medium normal-case px-2 py-1 rounded-md border shrink-0 transition-colors ${
                      notesByTag?.[group.tag]
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {notesByTag?.[group.tag] ? (
                      <Book className="w-3.5 h-3.5" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3">{group.items.map(renderCard)}</div>
                  </div>
                </div>
              </div>
            );
          })
        : questions.map(renderCard)}
    </div>
  );
}
