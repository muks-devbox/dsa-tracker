import { useEffect, useRef, useState } from 'react';
import { X, Pencil, Bold, Italic, Quote, Code, Terminal, Heading, List } from 'lucide-react';
import {
  renderMarkdownLite,
  wrapSelection,
  toggleQuote,
  insertCodeBlock,
  toggleHeading,
  toggleList,
} from '@/lib/markdown';

export default function TopicNoteModal({ open, tag, content, problemCount, onClose, onSave }) {
  const [mode, setMode] = useState('view');
  const [value, setValue] = useState(content || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(content || '');
      setMode(content ? 'view' : 'edit');
      setError(null);
    }
  }, [open, tag]);

  if (!open) return null;

  function startEdit() {
    setMode('edit');
    setError(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(value);
      setMode('view');
    } catch (err) {
      console.error('Failed to save topic note', err);
      setError(
        err?.code === 'permission-denied'
          ? "Couldn't save — Firestore rules for topicNotes may not be published yet."
          : "Couldn't save. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }
  function handleCancel() {
    setValue(content || '');
    setError(null);
    setMode('view');
  }

  const applyHeading = () => toggleHeading(textareaRef.current, value, setValue, 3);
  const applyBold = () => wrapSelection(textareaRef.current, value, setValue, '**', 'bold text');
  const applyItalic = () => wrapSelection(textareaRef.current, value, setValue, '*', 'italic text');
  const applyList = () => toggleList(textareaRef.current, value, setValue);
  const applyQuoteFmt = () => toggleQuote(textareaRef.current, value, setValue);
  const applyInlineCode = () => wrapSelection(textareaRef.current, value, setValue, '`', 'code');
  const applyCodeBlock = () => insertCodeBlock(textareaRef.current, value, setValue, 'your code here');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-md w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-2xl font-extrabold text-primary tracking-tight pr-8">
          {tag}
        </h2>
        <p className="font-mono text-sm text-muted-foreground mt-1.5">
          Pattern Playbook • {problemCount} problem{problemCount !== 1 ? 's' : ''} in this topic
        </p>

        {mode === 'view' ? (
          <>
            <div className="mt-5">
              {value ? (
                <div
                  className="md-content text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownLite(value) }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No pattern notes yet for this topic. Add the common recognition cues and
                  step-by-step approach you use to solve {tag} problems.
                </p>
              )}
            </div>
            <button
              onClick={startEdit}
              className="mt-6 w-full flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {value ? 'Edit Pattern Notes' : 'Add Pattern Notes'}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 flex-wrap mt-5 mb-2 border border-border rounded-md px-2 py-1.5 bg-background">
              <ToolbarButton icon={Heading} title="Heading" onClick={applyHeading} />
              <ToolbarButton icon={Bold} title="Bold" onClick={applyBold} />
              <ToolbarButton icon={Italic} title="Italic" onClick={applyItalic} />
              <ToolbarButton icon={List} title="Bullet list" onClick={applyList} />
              <ToolbarButton icon={Quote} title="Quote" onClick={applyQuoteFmt} />
              <ToolbarButton icon={Code} title="Inline code" onClick={applyInlineCode} />
              <ToolbarButton icon={Terminal} title="Code block" onClick={applyCodeBlock} />
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`e.g. how to recognize a ${tag} problem, and the usual steps to solve one...`}
              className="w-full h-[45vh] resize-none border border-border rounded-md px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
            />
            {error && (
              <p className="text-destructive text-xs mt-2">{error}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
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
