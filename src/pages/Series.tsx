import { useEffect, useState } from "react";
import { getTopRatedSeries, getAiringTodaySeries } from "../api/tmdb";
import type { MediaItem } from "./Home";
import { useAuth } from "../context/AuthContext";
import { saveFavorite, removeFavorite } from "../services/favorites";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

const Series = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesIdSet } = useFavorites();
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [airingToday, setAiringToday] = useState<MediaItem[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingAiring, setLoadingAiring] = useState(false);

  useEffect(() => {
    const fetchTopRated = async () => {
      setLoadingTop(true);
      try {
        const data = await getTopRatedSeries();
        const items = (data.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({ ...item, media_type: "tv" as const }));
        setTopRated(items);
      } catch (e) {
        console.error("Error al obtener top rated series", e);
      } finally {
        setLoadingTop(false);
      }
    };

    const fetchAiringToday = async () => {
      setLoadingAiring(true);
      try {
        const data = await getAiringTodaySeries();
        const items = (data.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({ ...item, media_type: "tv" as const }));
        setAiringToday(items);
      } catch (e) {
        console.error("Error al obtener series emitidas hoy", e);
      } finally {
        setLoadingAiring(false);
      }
    };

    fetchTopRated();
    fetchAiringToday();
  }, []);

  const renderGrid = (items: MediaItem[]) => (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex-shrink-0 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 w-full h-[220px] sm:h-[250px] relative"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-full rounded-lg ring-1 ring-white/10 hover:ring-emerald-500/30">
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.title || item.name}
              className="w-full h-full object-cover pointer-events-none"
            />

            {hoveredId === item.id && (
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-50 pointer-events-auto">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">{item.title || item.name}</h3>
                {item.overview && (
                  <p className="text-white/80 text-xs mb-3 line-clamp-2 font-mono">{item.overview}</p>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    if (favoritesIdSet.has(item.id)) {
                      await removeFavorite(user, item.id);
                    } else {
                      await saveFavorite(user, {
                        id: item.id,
                        name: item.name,
                        overview: item.overview,
                        poster_path: item.poster_path,
                        media_type: "tv",
                      });
                    }
                  }}
                  className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-mono ${favoritesIdSet.has(item.id) ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                >
                  {favoritesIdSet.has(item.id) ? "Quitar" : "+ Guardar"}
                </button>
              </div>
            )}

            <div className="absolute top-3 left-3 z-20">
              <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">SERIE</span>
            </div>
          </div>

          {/* Botón fijo debajo removido, usamos overlay */}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-8xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">Mejor valoradas</h2>
          </div>
        </div>
        {loadingTop ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          renderGrid(topRated)
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>
      <div className="max-w-8xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">Series emitidas hoy</h2>
          </div>
        </div>
        {loadingAiring ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          renderGrid(airingToday)
        )}
      </div>
    </div>
  );
};

export default Series;


