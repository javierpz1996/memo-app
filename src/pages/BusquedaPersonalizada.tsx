import { useSearch } from "../context/SearchContext";

import { searchMulti } from "../api/tmdb";
import { useEffect, useState } from "react";
import type { MediaItem } from "./Home";
import { useAuth } from "../context/AuthContext";
import { saveFavorite } from "../services/favorites";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { removeFavorite } from "../services/favorites";

const BusquedaPersonalizada = () => {
  const { Busqueda } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesIdSet } = useFavorites();
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const data = await searchMulti(Busqueda);
        const filtrarData = data.results.filter(
          (item: MediaItem) =>
            item.media_type === "movie" ||
            (item.media_type === "tv" && item.poster_path && item.overview)
        );
        setSearchResults(filtrarData);
        console.log("Este es el filtrarData", filtrarData);
      } catch (error) {
        console.error("Error al buscar:", error);
      } finally {
        setLoading(false);
      }
    };
    if (Busqueda) {
      fetchSearch();
    }
  }, [Busqueda]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-8xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">
              Resultados de búsqueda
            </h2>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="group flex-shrink-0 transform transition-all duration-300 hover:scale-105 hover:z-10 w-full relative"
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-[220px] sm:h-[250px] rounded-lg ring-1 ring-white/10 hover:ring-emerald-500/30">
                  {/* Imagen de poster */}
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Overlay con información en hover */}
                  {hoveredItemId === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-50 pointer-events-auto">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">
                        {item.title || item.name}
                      </h3>
                      {item.overview && (
                        <p className="text-white/80 text-xs mb-3 line-clamp-2 font-mono">
                          {item.overview}
                        </p>
                      )}
                      {/* Botón Guardar/Quitar dentro del overlay */}
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
                              name: item.name,
                              overview: item.overview,
                              poster_path: item.poster_path,
                              media_type: item.media_type,
                            });
                          }
                        }}
                        className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-mono ${
                          favoritesIdSet.has(item.id)
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } text-white`}
                      >
                        {favoritesIdSet.has(item.id) ? "Quitar" : "+ Guardar"}
                      </button>
                    </div>
                  )}

                  {/* Badge tipo de media */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">
                      {item.media_type === "movie" ? "PELÍCULA" : "SERIE"}
                    </span>
                  </div>
                </div>

                {/* Botón fijo debajo removido (usamos overlay) */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusquedaPersonalizada;
