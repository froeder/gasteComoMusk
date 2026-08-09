import { addDoc, collection, doc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore";

import type { GameStateSnapshot, LeaderboardEntry, UserProfile } from "@/src/types";
import { getFirebaseDb } from "@/src/services/firebase/config";

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    return;
  }

  await setDoc(doc(db, "profiles", profile.userId), profile, { merge: true });
}

export async function saveGame(game: GameStateSnapshot): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    return;
  }

  await setDoc(doc(db, "games", game.id), game, { merge: true });
}

export async function publishLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    return;
  }

  await addDoc(collection(db, "leaderboards", "global", "entries"), entry);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(query(collection(db, "leaderboards", "global", "entries"), orderBy("totalSpentCents", "desc"), limit(50)));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as LeaderboardEntry);
}
