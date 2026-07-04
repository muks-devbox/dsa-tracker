import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PLATFORMS, PRESET_TAGS } from '@/lib/constants';
import { CONFIDENCE_LABELS, getToday } from '@/lib/srs';

const emptyForm = {
  name: '',
  platform: 'LeetCode',
  tags: [],
  confidence: 3,
  lastRevised: getToday(),
  timeComplexity: '',
  approach: '',
  mistakeNotes: '',
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
              tags: editingQuestion.tags || [],
              confidence: editingQuestion.confidence || 3,
              lastRevised: editingQuestion.lastRevised || getToday(),
              timeComplexity: editingQuestion.timeComplexity || '',
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card h-full overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-primary tracking-tight">
            {editingQuestion ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <Field label="Problem Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
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
            <Field label="Confidence">
              <select
                value={form.confidence}
                onChange={(e) => setForm((f) => ({ ...f, confidence: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    Lv {n} — {CONFIDENCE_LABELS[n]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Topics / Tags">
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-primary/15 border-primary text-primary font-medium'
                      : 'border-border hover:bg-black/[0.02]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 border-dashed rounded-md p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                Add custom topic
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Monotonic Stack"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="bg-primary text-primary-foreground px-3 rounded-md hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.tags.filter((t) => !PRESET_TAGS.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags
                    .filter((t) => !PRESET_TAGS.includes(t))
                    .map((t) => (
                      <span
                        key={t}
                        onClick={() => toggleTag(t)}
                        className="bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        {t} ✕
                      </span>
                    ))}
                </div>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Time Complexity">
              <input
                type="text"
                placeholder="e.g. O(n log n)"
                value={form.timeComplexity}
                onChange={(e) => setForm((f) => ({ ...f, timeComplexity: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
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

          <Field label="Approach / Logic">
            <textarea
              rows={4}
              value={form.approach}
              onChange={(e) => setForm((f) => ({ ...f, approach: e.target.value }))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>

          <Field label="Mistakes / Watch-outs">
            <textarea
              rows={4}
              value={form.mistakeNotes}
              onChange={(e) => setForm((f) => ({ ...f, mistakeNotes: e.target.value }))}
              className="w-full bg-background border border-destructive/40 rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-destructive/30"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-border py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Record
            </button>
          </div>
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
