import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
export type RecordRow = { id: string; [key: string]: unknown };
export type RecordState = { rows: RecordRow[]; loading: boolean; error: string };
export function useRecords(name: string): RecordState {
  const [state, setState] = useState<RecordState>({ rows: [], loading: true, error: '' });
  useEffect(() => onSnapshot(collection(db, name), snapshot => setState({ rows: snapshot.docs.map(item => ({ ...item.data(), id: item.id })), loading: false, error: '' }), error => setState({ rows: [], loading: false, error: error.code === 'permission-denied' ? 'Database permissions denied access to these records. The administrator access rules need to be checked.' : 'Records could not load. Check your connection and reload to retry.' })), [name]);
  return state;
}
export function recordTime(value: unknown) { return value instanceof Timestamp ? value.toMillis() : 0; }
export function recordDate(value: unknown) { return value instanceof Timestamp ? value.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'; }
