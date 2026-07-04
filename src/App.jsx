import { useMemo, useState } from 'react';
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

      <SearchFilter
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {sortedQuestions.length === 0 ? (
        <div className="border border-dashed border-border rounded-md py-16 text-center text-muted-foreground text-sm">
          {questions.length === 0
            ? 'No problems logged yet. Add your first entry to get started.'
            : 'No problems match your search or filters.'}
        </div>
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
