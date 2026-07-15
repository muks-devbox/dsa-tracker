import { useMemo, useState } from 'react';
import { Layers, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestions } from '@/hooks/useQuestions';
import { isDue } from '@/lib/srs';
import { exportQuestionsToCSV } from '@/lib/csv';
import Login from '@/components/Login';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import SearchFilter from '@/components/SearchFilter';
import QuestionTable from '@/components/QuestionTable';
import QuestionCards from '@/components/QuestionCards';
import QuestionDrawer from '@/components/QuestionDrawer';
import QuestionDetail from '@/components/QuestionDetail';
import DeleteDialog from '@/components/DeleteDialog';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { questions, addQuestion, updateQuestion, deleteQuestion, markRevised } =
    useQuestions();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ platform: 'All', tag: 'All', confidence: 'All' });
  const [viewMode, setViewMode] = useState('topic'); // 'topic' | 'recent'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (search && !q.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.platform !== 'All' && q.platform !== filters.platform) return false;
      if (filters.tag !== 'All' && !(q.tags || []).includes(filters.tag)) return false;
      if (filters.confidence !== 'All' && String(q.confidence) !== filters.confidence)
        return false;
      return true;
    });
  }, [questions, search, filters]);

  // Due items first, then by next-revision urgency
  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      const aDue = isDue(a.lastRevised, a.confidence);
      const bDue = isDue(b.lastRevised, b.confidence);
      if (aDue !== bDue) return aDue ? -1 : 1;
      return 0;
    });
  }, [filteredQuestions]);

  // Bucketed by each question's primary (first) tag, sorted alphabetically;
  // "Uncategorized" (no tags) always sits last. Within a group, due items
  // float to the top, then alphabetical by name.
  const groupedQuestions = useMemo(() => {
    const map = new Map();
    filteredQuestions.forEach((q) => {
      const tag = (q.tags && q.tags[0]) || 'Uncategorized';
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(q);
    });

    const groups = Array.from(map.entries()).map(([tag, items]) => ({
      tag,
      items: [...items].sort((a, b) => {
        const aDue = isDue(a.lastRevised, a.confidence);
        const bDue = isDue(b.lastRevised, b.confidence);
        if (aDue !== bDue) return aDue ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    }));

    groups.sort((a, b) => {
      if (a.tag === 'Uncategorized') return 1;
      if (b.tag === 'Uncategorized') return -1;
      return a.tag.localeCompare(b.tag);
    });

    return groups;
  }, [filteredQuestions]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  function openAddDrawer() {
    setEditingQuestion(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(question) {
    setEditingQuestion(question);
    setDrawerOpen(true);
    setViewingQuestion(null);
  }

  async function handleSave(formData) {
    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, formData);
    } else {
      await addQuestion(formData);
    }
    setDrawerOpen(false);
    setEditingQuestion(null);
  }

  async function handleConfirmDelete() {
    if (deletingQuestion) {
      await deleteQuestion(deletingQuestion.id);
      setDeletingQuestion(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 py-6 max-w-6xl mx-auto">
      <Header
        onAdd={openAddDrawer}
        onExport={() => exportQuestionsToCSV(questions)}
        exportDisabled={questions.length === 0}
      />

      <StatsBar questions={questions} />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchFilter
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
        <div className="flex border border-border rounded-md overflow-hidden mb-4 shrink-0">
          <button
            onClick={() => setViewMode('topic')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
              viewMode === 'topic' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-black/[0.02]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            By Topic
          </button>
          <button
            onClick={() => setViewMode('recent')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-l border-border ${
              viewMode === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-black/[0.02]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recent
          </button>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="border border-dashed border-border rounded-md py-16 text-center text-muted-foreground text-sm">
          {questions.length === 0
            ? 'No problems logged yet. Add your first entry to get started.'
            : 'No problems match your search or filters.'}
        </div>
      ) : viewMode === 'topic' ? (
        <>
          <QuestionTable
            groups={groupedQuestions}
            onView={setViewingQuestion}
            onEdit={openEditDrawer}
            onDelete={setDeletingQuestion}
            onMarkRevised={markRevised}
          />
          <QuestionCards
            groups={groupedQuestions}
            onView={setViewingQuestion}
            onEdit={openEditDrawer}
            onDelete={setDeletingQuestion}
            onMarkRevised={markRevised}
          />
        </>
      ) : (
        <>
          <QuestionTable
            questions={sortedQuestions}
            onView={setViewingQuestion}
            onEdit={openEditDrawer}
            onDelete={setDeletingQuestion}
            onMarkRevised={markRevised}
          />
          <QuestionCards
            questions={sortedQuestions}
            onView={setViewingQuestion}
            onEdit={openEditDrawer}
            onDelete={setDeletingQuestion}
            onMarkRevised={markRevised}
          />
        </>
      )}

      <QuestionDetail
        open={!!viewingQuestion}
        question={questions.find((q) => q.id === viewingQuestion?.id) || viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        onEdit={openEditDrawer}
        onMarkRevised={markRevised}
      />

      <QuestionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        editingQuestion={editingQuestion}
      />

      <DeleteDialog
        open={!!deletingQuestion}
        question={deletingQuestion}
        onCancel={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
