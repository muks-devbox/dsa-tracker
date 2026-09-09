import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PLATFORMS, PRESET_TAGS } from '@/lib/constants';
import { CONFIDENCE_LABELS, getToday } from '@/lib/srs';
import MarkdownEditorField from '@/components/MarkdownEditorField';

const emptyForm = {
  name: '',
  platform: 'LeetCode',
  problemLink: '',
  tags: [],
  confidence: 3,
  lastRevised: getToday(),
  timeComplexity: '',
  gist: '',
  approach: '',
  mistakeNotes: '',
};

const CONFIDENCE_ACCENT = {
  1: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive' },
  2: { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive' },
  3: { text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  4: { text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
  5: { text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
};

export default function QuestionDrawer({ open, onClose, onSave, editingQuestion }) {
  const [form, setForm] = useState(emptyForm);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        editingQuestion
          ? {
              name: editingQuestion.name || '',
              platform: editingQuestion.platform || 'LeetCode',
              problemLink: editingQuestion.problemLink || '',
              tags: editingQuestion.tags || [],
              confidence: editingQuestion.confidence || 3,
              lastRevised: editingQuestion.lastRevised || getToday(),
              timeComplexity: editingQuestion.timeComplexity || '',
              gist: editingQuestion.gist || '',
              approach: editingQuestion.approach || '',
              mistakeNotes: editingQuestion.mistakeNotes || '',
            }
          : emptyForm
      );
      setCustomTag('');
    }
  }, [open, editingQuestion]);

  if (!open) return null;

  function toggleTag(tag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  }

  function addCustomTag() {
    const tag = customTag.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setCustomTag('');
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...form, confidence: Number(form.confidence) });
  }

  const customTags = form.tags.filter((t) => !PRESET_TAGS.includes(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 animate-backdrop-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-card rounded-md shadow-xl animate-modal-in flex flex-col">
        {/* Sticky header */}
        <div className="shrink-0 flex justify-between items-center px-8 py-5 border-b border-border">
          <h2 className="font-display text-xl font-bold text-primary tracking-tight">
            {editingQuestion ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Problem Name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="Problem Link (optional)">
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={form.problemLink}
                onChange={(e) => setForm((f) => ({ ...f, problemLink: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Platform">
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Last Revised">
              <input
                type="date"
                value={form.lastRevised}
                onChange={(e) => setForm((f) => ({ ...f, lastRevised: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
          </div>

          <Field label="Confidence">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const accent = CONFIDENCE_ACCENT[n];
                const selected = Number(form.confidence) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, confidence: n }))}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-md border py-2.5 transition-all active:scale-95 ${
                      selected
                        ? `${accent.bg} ${accent.border} ${accent.text}`
                        : 'border-border text-muted-foreground hover:bg-black/[0.02]'
                    }`}
                  >
                    <span className="font-mono font-bold text-base leading-none">{n}</span>
                    <span className="text-[10px] leading-none">{CONFIDENCE_LABELS[n]}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Topics / Tags">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors active:scale-95 ${
                    form.tags.includes(tag)
                      ? 'bg-primary/15 border-primary text-primary font-medium'
                      : 'border-border text-muted-foreground hover:bg-black/[0.02] hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 border-dashed rounded-md p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a custom topic..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90 active:scale-[0.97] transition-transform shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {customTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="flex items-center gap-1 bg-primary/15 text-primary text-xs px-2.5 py-1 rounded-full hover:bg-primary/25 transition-colors"
                    >
                      {t}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <MarkdownEditorField
            label="Problem Gist (in your own words)"
            value={form.gist}
            onChange={(v) => setForm((f) => ({ ...f, gist: v }))}
            placeholder="Click to write a short summary of what the problem asks — 4-5 lines is plenty..."
          />

          <Field label="Time Complexity">
            <input
              type="text"
              placeholder="e.g. O(n log n)"
              value={form.timeComplexity}
              onChange={(e) => setForm((f) => ({ ...f, timeComplexity: e.target.value }))}
              className="w-full sm:w-1/2 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>

          <MarkdownEditorField
            label="Approach / Logic"
            value={form.approach}
            onChange={(v) => setForm((f) => ({ ...f, approach: v }))}
            placeholder="Click to write your solution notes..."
          />

          <MarkdownEditorField
            label="Mistakes / Watch-outs"
            value={form.mistakeNotes}
            onChange={(v) => setForm((f) => ({ ...f, mistakeNotes: v }))}
            placeholder="Click to note what went wrong..."
            destructive
          />
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 flex gap-3 px-8 py-5 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}
