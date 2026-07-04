import { Download, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Header({ onAdd, onExport, exportDisabled }) {
  const { signOut } = useAuth();

  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
         DSA Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Spaced Repetition Tracker
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          disabled={exportDisabled}
          className="flex items-center gap-2 border border-border bg-card px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-black/[0.02] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>
        <button
          onClick={signOut}
          title="Sign out"
          className="flex items-center gap-2 border border-border bg-card p-2 rounded-md text-sm hover:bg-black/[0.02] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
