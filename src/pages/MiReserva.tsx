import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { removeFavorite } from "../services/favorites";

const MiReserva = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-lg font-mono">Inicia sesión para ver tus reservas.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-8xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white font-mono">Mi reserva</h2>
        </div>
        {favorites.length === 0 ? (
          <p className="text-gray-300 font-mono">No tienes elementos guardados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="w-full">
                <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-[250px] rounded-lg">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">
                      {item.media_type === "movie" ? "PELÍCULA" : "SERIE"}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-white font-mono text-sm line-clamp-1">
                    {item.title || item.name}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      await removeFavorite(user, item.id);
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm font-mono"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {favorites.length > 0 && (
          <>
            <div className="mt-8 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const list = favorites
                    .map((f) => `• ${f.title || f.name}`)
                    .join("%0A");
                  const text = `Necesitamos ver todas estas series/películas, te espero pronto:%0A%0A${list}`;
                  const url = `https://wa.me/?text=${text}`;
                  window.open(url, "_blank");
                }}
                className="mt-5 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-sm font-mono"
              >
                Compartir por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiReserva;


