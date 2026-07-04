import { useMemo } from 'react';
import { Boxes, AlertCircle, Flame, Target, Clock } from 'lucide-react';
import { isDue } from '@/lib/srs';

export default function StatsBar({ questions }) {
  const stats = useMemo(() => {
    const total = questions.length;
    const weakQuestions = questions.filter((q) => q.confidence <= 2);
    const weak = weakQuestions.length;
    const strong = questions.filter((q) => q.confidence >= 4).length;
    const dueToday = questions.filter((q) =>
      isDue(q.lastRevised, q.confidence)
    ).length;

    const tagCounts = {};
    weakQuestions.forEach((q) => {
      (q.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const weakTopic =
      Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    return { total, weak, strong, weakTopic, dueToday };
  }, [questions]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      <StatCard icon={Boxes} label="Total" value={stats.total} iconColor="text-primary" />
      <StatCard icon={AlertCircle} label="Weak" value={stats.weak} iconColor="text-destructive" />
      <StatCard icon={Flame} label="Strong" value={stats.strong} iconColor="text-emerald-600" />
      <StatCard
        icon={Target}
        label="Weak Topic"
        value={stats.weakTopic}
        iconColor="text-muted-foreground"
        className="hidden md:block"
        valueClassName="text-xl truncate"
      />
      <StatCard
        icon={Clock}
        label="Due Today"
        value={stats.dueToday}
        iconColor="text-primary"
        highlight
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, iconColor, className = '', valueClassName = '', highlight = false }) {
  return (
    <div
      className={`border border-border rounded-md p-4 ${
        highlight ? 'bg-primary/10 border-primary/20' : 'bg-card'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <div className={`font-mono font-bold text-3xl ${highlight ? 'text-primary' : ''} ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}
