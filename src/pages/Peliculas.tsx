import { useEffect, useState } from "react";
import { getTopRatedMovies, getUpcomingMovies } from "../api/tmdb";
import type { MediaItem } from "./Home";
import { useAuth } from "../context/AuthContext";
import { saveFavorite, removeFavorite } from "../services/favorites";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

const Peliculas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesIdSet } = useFavorites();
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  useEffect(() => {
    const fetchTopRated = async () => {
      setLoadingTop(true);
      try {
        const data = await getTopRatedMovies();
        const items = (data.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({ ...item, media_type: "movie" as const }));
        setTopRated(items);
      } catch (e) {
        console.error("Error al obtener top rated películas", e);
      } finally {
        setLoadingTop(false);
      }
    };

    const fetchUpcoming = async () => {
      setLoadingUpcoming(true);
      try {
        const data = await getUpcomingMovies();
        const items = (data.results || [])
          .filter((item: any) => item.poster_path)
          .map((item: any) => ({ ...item, media_type: "movie" as const }));
        setUpcoming(items);
      } catch (e) {
        console.error("Error al obtener próximas películas", e);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    fetchTopRated();
    fetchUpcoming();
  }, []);

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
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {topRated.map((item) => (
              <div
                key={item.id}
                className="group flex-shrink-0 transform transition-all duration-300 hover:scale-105 hover:z-10 w-full relative"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-[220px] sm:h-[250px] rounded-lg ring-1 ring-white/10 hover:ring-emerald-500/30">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {hoveredId === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-50 pointer-events-auto">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">
                        {item.title || item.name}
                      </h3>
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
                              title: item.title,
                              overview: item.overview,
                              poster_path: item.poster_path,
                              media_type: "movie",
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
                    <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">PELÍCULA</span>
                  </div>
                </div>

                {/* Botón fijo debajo removido, usamos overlay */}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>
      <div className="max-w-8xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">Próximas películas</h2>
          </div>
        </div>
        {loadingUpcoming ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="group flex-shrink-0 transform transition-all duration-300 hover:scale-105 hover:z-10 w-full relative"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-[220px] sm:h-[250px] rounded-lg">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {hoveredId === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-50 pointer-events-auto">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">
                        {item.title || item.name}
                      </h3>
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
                              title: item.title,
                              overview: item.overview,
                              poster_path: item.poster_path,
                              media_type: "movie",
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
                    <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">PELÍCULA</span>
                  </div>
                </div>

                {/* Botón fijo debajo removido, usamos overlay */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Peliculas;


