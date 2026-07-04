import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'questions'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort client-side by createdAt desc. Freshly-added docs may have a
        // null createdAt for one tick (server timestamp still pending) — treat
        // those as "now" so they float to the top instead of disappearing.
        docs.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? Date.now();
          const bTime = b.createdAt?.toMillis?.() ?? Date.now();
          return bTime - aTime;
        });
        setQuestions(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore listen error', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function addQuestion(data) {
    await addDoc(collection(db, 'questions'), {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateQuestion(id, data) {
    await updateDoc(doc(db, 'questions', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteQuestion(id) {
    await deleteDoc(doc(db, 'questions', id));
  }

  async function markRevised(question) {
    const today = new Date().toISOString().slice(0, 10);
    await updateQuestion(question.id, { lastRevised: today });
  }

  return {
    questions,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    markRevised,
  };
}
