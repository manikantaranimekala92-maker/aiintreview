import {
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot
} from '../lib/firebase';
import { User, InterviewSession } from '../types';

export const firestoreService = {
  // Save or update user profile document in Firestore
  async saveUser(user: User): Promise<void> {
    try {
      if (!user.id) return;
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUser error:', err);
    }
  },

  // Fetch user profile from Firestore
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (err) {
      console.warn('Firestore getUser error:', err);
    }
    return null;
  },

  // Save or update an interview session in Firestore
  async saveInterviewSession(session: InterviewSession): Promise<void> {
    try {
      if (!session.id) return;
      const sessionRef = doc(db, 'interviewSessions', session.id);
      // Clean undefined fields before writing to Firestore
      const cleanSession = JSON.parse(JSON.stringify(session));
      await setDoc(sessionRef, {
        ...cleanSession,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveInterviewSession error:', err);
    }
  },

  // Fetch all interview sessions for candidate
  async getCandidateSessions(candidateId: string, candidateEmail: string): Promise<InterviewSession[]> {
    try {
      const sessionsRef = collection(db, 'interviewSessions');
      const q = query(sessionsRef);
      const querySnapshot = await getDocs(q);
      const results: InterviewSession[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as InterviewSession;
        if (
          data.candidateId === candidateId ||
          (data.candidateEmail && candidateEmail && data.candidateEmail.toLowerCase() === candidateEmail.toLowerCase())
        ) {
          results.push(data);
        }
      });
      return results;
    } catch (err) {
      console.warn('Firestore getCandidateSessions error:', err);
      return [];
    }
  },

  // Delete an interview session from Firestore
  async deleteInterviewSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'interviewSessions', sessionId);
      await deleteDoc(sessionRef);
    } catch (err) {
      console.warn('Firestore deleteInterviewSession error:', err);
    }
  },

  // Realtime subscription for candidate sessions
  subscribeCandidateSessions(
    candidateId: string,
    candidateEmail: string,
    onUpdate: (sessions: InterviewSession[]) => void
  ): () => void {
    try {
      const sessionsRef = collection(db, 'interviewSessions');
      return onSnapshot(sessionsRef, (snapshot) => {
        const results: InterviewSession[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as InterviewSession;
          if (
            data.candidateId === candidateId ||
            (data.candidateEmail && candidateEmail && data.candidateEmail.toLowerCase() === candidateEmail.toLowerCase())
          ) {
            results.push(data);
          }
        });
        onUpdate(results);
      }, (err) => {
        console.warn('Firestore snapshot listener error:', err);
      });
    } catch (err) {
      console.warn('Firestore subscribeCandidateSessions setup error:', err);
      return () => {};
    }
  }
};
