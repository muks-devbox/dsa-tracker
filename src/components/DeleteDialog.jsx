export default function DeleteDialog({ open, question, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-md p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-semibold text-lg mb-2">Are you sure?</h3>
        <p className="text-muted-foreground text-sm mb-6">
          This will permanently delete "{question?.name}". This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-border py-2 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
