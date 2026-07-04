import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Quote, Code, Terminal, Heading, List, Maximize2, X } from 'lucide-react';
import {
  renderMarkdownLite,
  wrapSelection,
  toggleQuote,
  insertCodeBlock,
  toggleHeading,
  toggleList,
} from '@/lib/markdown';

export default function MarkdownEditorField({ label, value, onChange, placeholder, destructive = false }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(value || '');
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, value]);

  function applyBold() {
    wrapSelection(textareaRef.current, draft, setDraft, '**', 'bold text');
  }
  function applyItalic() {
    wrapSelection(textareaRef.current, draft, setDraft, '*', 'italic text');
  }
  function applyQuoteFmt() {
    toggleQuote(textareaRef.current, draft, setDraft);
  }
  function applyInlineCode() {
    wrapSelection(textareaRef.current, draft, setDraft, '`', 'code');
  }
  function applyCodeBlock() {
    insertCodeBlock(textareaRef.current, draft, setDraft, 'your code here');
  }
  function applyHeading() {
    toggleHeading(textareaRef.current, draft, setDraft, 3);
  }
  function applyList() {
    toggleList(textareaRef.current, draft, setDraft);
  }

  function handleDone() {
    onChange(draft);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  const accentBorder = destructive ? 'border-destructive/40' : 'border-border';
  const accentBg = destructive ? 'bg-destructive/5' : 'bg-background';

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left rounded-md border ${accentBorder} ${accentBg} px-3 py-2 min-h-[5.5rem] text-sm hover:bg-black/[0.02] transition-colors group relative`}
      >
        {value ? (
          <div
            className="md-content line-clamp-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdownLite(value) }}
          />
        ) : (
          <span className="text-muted-foreground italic">{placeholder || 'Click to write...'}</span>
        )}
        <Maximize2 className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
          <div className="relative bg-card border border-border rounded-md w-full max-w-2xl h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="font-semibold">{label}</h3>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-5 py-2 border-b border-border">
              <ToolbarButton icon={Heading} title="Heading" onClick={applyHeading} />
              <ToolbarButton icon={Bold} title="Bold" onClick={applyBold} />
              <ToolbarButton icon={Italic} title="Italic" onClick={applyItalic} />
              <ToolbarButton icon={List} title="Bullet list" onClick={applyList} />
              <ToolbarButton icon={Quote} title="Quote" onClick={applyQuoteFmt} />
              <ToolbarButton icon={Code} title="Inline code" onClick={applyInlineCode} />
              <ToolbarButton icon={Terminal} title="Code block" onClick={applyCodeBlock} />
              <span className="text-xs text-muted-foreground ml-2 hidden lg:inline">
                Select text, then click a button — or just start typing
              </span>
            </div>

            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-full resize-none px-5 py-4 text-sm font-mono focus:outline-none bg-transparent"
            />

            <div className="flex gap-3 px-5 py-3 border-t border-border">
              <button
                onClick={handleCancel}
                className="flex-1 border border-border py-2 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-md border border-border hover:bg-black/[0.03] transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
