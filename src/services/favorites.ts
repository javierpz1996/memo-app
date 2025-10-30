import { db } from "../firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

export interface FavoriteItemPayload {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  media_type: "movie" | "tv";
}

export const saveFavorite = async (user: User, item: FavoriteItemPayload) => {
  const ref = doc(db, "users", user.uid, "favorites", String(item.id));
  await setDoc(ref, { ...item, savedAt: Date.now() }, { merge: true });
};

export const removeFavorite = async (user: User, itemId: number) => {
  const ref = doc(db, "users", user.uid, "favorites", String(itemId));
  await deleteDoc(ref);
};


