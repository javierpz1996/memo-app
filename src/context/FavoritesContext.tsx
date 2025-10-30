import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import type { FavoriteItemPayload } from "../services/favorites";

interface FavoritesContextValue {
  favorites: FavoriteItemPayload[];
  favoritesIdSet: Set<number>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItemPayload[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Esperar a que Auth resuelva para evitar parpadeo al F5
    if (authLoading) return;
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const ref = collection(db, "users", user.uid, "favorites");

    // Precarga inmediata (en caso de que onSnapshot tarde)
    getDocs(ref)
      .then((snap) => {
        const items: FavoriteItemPayload[] = snap.docs.map((d) => {
          const data = d.data() as FavoriteItemPayload;
          const { id: _ignored, ...rest } = data as any;
          return { id: Number(d.id), ...rest } as FavoriteItemPayload;
        });
        setFavorites(items);
      })
      .catch((e) => console.error("Error precargando favoritos:", e))
      .finally(() => setLoading(false));

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const items: FavoriteItemPayload[] = snap.docs.map((d) => {
          const data = d.data() as FavoriteItemPayload;
          const { id: _ignored, ...rest } = data as any;
          return { id: Number(d.id), ...rest } as FavoriteItemPayload;
        });
        setFavorites(items);
        // no tocar loading aquí si ya se resolvió arriba; pero si aún está true, lo marcamos en false
        setLoading(false);
      },
      (error) => {
        console.error("Error suscribiendo favoritos:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, authLoading]);

  const favoritesIdSet = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const value: FavoritesContextValue = { favorites, favoritesIdSet, loading };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
};


