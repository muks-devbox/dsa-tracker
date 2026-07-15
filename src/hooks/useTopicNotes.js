import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useTopicNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]); // [{ id, tag, content }]

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    const q = query(collection(db, 'topicNotes'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('topicNotes listen error', err)
    );
    return unsub;
  }, [user]);

  const notesByTag = {};
  notes.forEach((n) => {
    notesByTag[n.tag] = n;
  });

  async function saveTopicNote(tag, content) {
    const existing = notesByTag[tag];
    if (existing) {
      await updateDoc(doc(db, 'topicNotes', existing.id), {
        content,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'topicNotes'), {
        userId: user.uid,
        tag,
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  return { notesByTag, saveTopicNote };
}
