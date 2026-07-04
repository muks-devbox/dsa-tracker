import { Code2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-border rounded-md p-10 max-w-sm w-full text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <Code2 className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-primary mb-1 tracking-tight">
          DSA Tracker
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Spaced Repetition Tracker
        </p>
        <button
          onClick={signIn}
          className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
