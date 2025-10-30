import { getTrendingMovies } from "../api/tmdb";
import { getTrendingSeries } from "../api/tmdb";
import { getMovieVideos } from "../api/tmdb";
import { getTvVideos } from "../api/tmdb";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { saveFavorite, removeFavorite } from "../services/favorites";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export interface MediaItem {
  id: number;
  title?: string;
  overview?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  media_type: "movie" | "tv";
  videoKey?: string; // Para guardar el key del trailer
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  adult?: boolean;
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesIdSet } = useFavorites();
  const moviesRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<HTMLDivElement | null>(null);

  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    const el = ref.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.9);
    el.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };
  // Mi estado para las películas y series en tendencia
  const [moviesTrending, setMoviesTrending] = useState<MediaItem[]>([]);
  const [seriesTrending, setSeriesTrending] = useState<MediaItem[]>([]);

  // Mi estado para el loading
  const [loading, setLoading] = useState(true);

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para controlar qué video está en hover
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null);
  const [hoveredSeriesId, setHoveredSeriesId] = useState<number | null>(null);

  ////////////////////////////////////////////////////////////////
  // Función para obtener el trailer de una película
  const getMovieTrailer = async (movieId: number) => {
    try {
      const videos = await getMovieVideos(movieId);
      const trailer = videos.results.find(
        (video: any) => video.type === "Trailer" && video.site === "YouTube"
      );
      return trailer?.key;
    } catch (error) {
      console.error("Error al obtener trailer:", error);
      return null;
    }
  };
  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////
  // Función para obtener el trailer de una serie
  const getTvTrailer = async (tvId: number) => {
    try {
      const videos = await getTvVideos(tvId);
      const trailer = videos.results.find(
        (video: any) => video.type === "Trailer" && video.site === "YouTube"
      );
      return trailer?.key;
    } catch (error) {
      console.error("Error al obtener trailer:", error);
      return null;
    }
  };

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  // Mi efecto para obtener las películas en tendencia con sus trailers
  useEffect(() => {
    const fetchMoviesTrending = async () => {
      try {
        const movies = await getTrendingMovies();
        const moviesFilter = movies.results.filter(
          (movie: MediaItem) =>
            movie.media_type === "movie" && movie.poster_path
        );

        // Obtener trailers para cada película
        const moviesWithVideos = await Promise.all(
          moviesFilter.map(async (movie: MediaItem) => {
            const videoKey = await getMovieTrailer(movie.id);
            return { ...movie, videoKey };
          })
        );

        // Filtrar solo las películas que tienen poster Y trailer
        const moviesWithTrailers = moviesWithVideos.filter(
          (movie) => movie.poster_path && movie.videoKey
        );

        setMoviesTrending(moviesWithTrailers);
      } catch (error) {
        console.error("Error al obtener las películas en tendencia", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMoviesTrending();
  }, []);

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  // Mi efecto para obtener las series en tendencia con sus trailers
  useEffect(() => {
    const fetchSeriesTrending = async () => {
      try {
        const series = await getTrendingSeries();
        const seriesFilter = series.results.filter(
          (series: MediaItem) =>
            series.media_type === "tv" && series.poster_path
        );

        // Obtener trailers para cada serie
        const seriesWithVideos = await Promise.all(
          seriesFilter.map(async (series: MediaItem) => {
            const videoKey = await getTvTrailer(series.id);
            return { ...series, videoKey };
          })
        );

        // Filtrar solo las series que tienen poster Y trailer
        const seriesWithTrailers = seriesWithVideos.filter(
          (series) => series.poster_path && series.videoKey
        );

        setSeriesTrending(seriesWithTrailers);
      } catch (error) {
        console.error("Error al obtener las series en tendencia", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeriesTrending();
  }, []);

  // Filtrar películas y series basándose en el término de búsqueda
  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return moviesTrending;
    return moviesTrending.filter(
      (movie) =>
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.overview?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [moviesTrending, searchTerm]);

  const filteredSeries = useMemo(() => {
    if (!searchTerm.trim()) return seriesTrending;
    return seriesTrending.filter(
      (series) =>
        series.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.overview?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [seriesTrending, searchTerm]);

  // Obtener la primera película para el hero heromovie aleatorio
  const heroMovie =
    filteredMovies.length > 0
      ? filteredMovies[Math.floor(Math.random() * filteredMovies.length)]
      : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-[75vh] w-full">
        {/* Background: Video de YouTube o Imagen */}
        {heroMovie && heroMovie.videoKey ? (
          <>
            {/* Imagen en mobile, video en sm+ */}
            <img
              src={`https://image.tmdb.org/t/p/w1920${
                heroMovie.backdrop_path || heroMovie.poster_path
              }`}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover sm:hidden"
            />
            <iframe
              className="absolute inset-0 w-full h-full object-cover scale-150 hidden sm:block"
              src={`https://www.youtube.com/embed/${heroMovie.videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroMovie.videoKey}&start=0&end=180&playlist=${heroMovie.videoKey}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              title={heroMovie.title}
              frameBorder="0"
              style={{ pointerEvents: "none" }}
            />
          </>
        ) : heroMovie ? (
          <img
            src={`https://image.tmdb.org/t/p/w1920${
              heroMovie.backdrop_path || heroMovie.poster_path
            }`}
            alt={heroMovie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0f172a]"></div>

        {/* Contenido del Hero */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-center space-y-6 w-full">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight font-mono drop-shadow-2xl">
              Películas y series que te cambian la vida
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto font-mono drop-shadow-lg">
              Para clásicos, para indies, para los que viven como si estuvieran
              en una película y para los que siempre quieren ver un capítulo
              más.
            </p>
          </div>
        </div>
      </div>

      {/* Movies Trending Section */}
      <div className="max-w-10xl mx-auto px-4 pb-0 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">
              Peliculas en tendencia
            </h2>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="relative mx-4 sm:mx-24 md:mx-28">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollContainer(moviesRef, "left")}
              className="flex absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-[130%] z-20 items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-2xl border border-white/10 ring-2 ring-white/10 backdrop-blur-md transition transform hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div
              ref={moviesRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            >
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className={`flex-shrink-0 cursor-pointer relative transition-all duration-300 ${
                    hoveredMovieId === movie.id
                      ? "w-[180px] h-[300px] sm:w-[300px] sm:h-[460px] md:w-[350px] md:h-[500px] z-50"
                      : "w-[160px] h-[260px] sm:w-[280px] sm:h-[420px] md:w-[350px] md:h-[450px]"
                  }`}
                  onMouseEnter={() => setHoveredMovieId(movie.id)}
                  onMouseLeave={() => setHoveredMovieId(null)}
                  onClick={() =>
                    setHoveredMovieId((prev) =>
                      prev === movie.id ? null : movie.id
                    )
                  }
                >
                  {hoveredMovieId === movie.id ? (
                    // Modal expandido en hover (imagen/video de fondo y overlay)
                    <div className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden w-full h-full">
                      {/* Media de fondo: imagen siempre visible; video solo en sm+ */}
                      {movie.videoKey ? (
                        <>
                          <img
                            src={`https://image.tmdb.org/t/p/w1280${
                              movie.backdrop_path || movie.poster_path
                            }`}
                            alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <iframe
                            className="absolute inset-0 w-full h-full object-cover hidden sm:block"
                            src={`https://www.youtube.com/embed/${movie.videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.videoKey}`}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            title={movie.title}
                            id={`video-${movie.id}`}
                            frameBorder="0"
                          />
                        </>
                      ) : (
                        <img
                          src={`https://image.tmdb.org/t/p/w1280${
                            movie.backdrop_path || movie.poster_path
                          }`}
                          alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {/* Overlay con texto y botón (como series) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-20 pointer-events-auto">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">
                          {movie.title}
                        </h3>
                        {movie.overview && (
                          <p className="text-white/80 text-xs mb-3 line-clamp-2 sm:line-clamp-3 font-mono">
                            {movie.overview}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user) {
                              navigate("/login");
                              return;
                            }
                            if (favoritesIdSet.has(movie.id)) {
                              await removeFavorite(user, movie.id);
                            } else {
                              await saveFavorite(user, {
                                id: movie.id,
                                title: movie.title,
                                overview: movie.overview,
                                poster_path: movie.poster_path,
                                media_type: "movie",
                              });
                            }
                          }}
                          className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-mono ${
                            favoritesIdSet.has(movie.id)
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          } text-white`}
                        >
                          {favoritesIdSet.has(movie.id)
                            ? "Quitar"
                            : "+ Guardar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Vista normal (card pequeña)
                    <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg w-full h-full transform transition-all duration-300">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 z-20">
                        <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">
                          PELÍCULA
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botón externo removido en Home (solo overlay) */}
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => scrollContainer(moviesRef, "right")}
              className="flex absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-[130%] z-20 items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-2xl border border-white/10 ring-2 ring-white/10 backdrop-blur-md transition transform hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Separador visual */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* Series Trending Section */}
      <div className="max-w-10xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded bg-emerald-500"></div>
            <h2 className="text-2xl font-semibold text-white font-mono">
              Series en tendencia
            </h2>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="relative mx-4 sm:mx-24 md:mx-28">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollContainer(seriesRef, "left")}
              className="flex absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-[130%] z-20 items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-2xl border border-white/10 ring-2 ring-white/10 backdrop-blur-md transition transform hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div
              ref={seriesRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            >
              {filteredSeries.map((series) => (
                <div
                  key={series.id}
                  className="group flex-shrink-0 cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10 w-[140px] h-[210px] sm:w-[167px] sm:h-[250px] relative"
                  onMouseEnter={() => setHoveredSeriesId(series.id)}
                  onMouseLeave={() => setHoveredSeriesId(null)}
                >
                  <div className="relative overflow-hidden bg-gray-800 shadow-lg w-full h-full flex items-center justify-center rounded-lg">
                    {/* Imagen de poster */}
                    <img
                      src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                      alt={series.name}
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay con información en hover */}
                    {hoveredSeriesId === series.id && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col justify-end z-20 pointer-events-auto">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 font-mono">
                          {series.name}
                        </h3>
                        {series.overview && (
                          <p className="text-white/80 text-xs mb-3 line-clamp-2 font-mono">
                            {series.overview}
                          </p>
                        )}

                        {/* Botón Guardar/Quitar dentro de la card */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user) {
                              navigate("/login");
                              return;
                            }
                            if (favoritesIdSet.has(series.id)) {
                              await removeFavorite(user, series.id);
                            } else {
                              await saveFavorite(user, {
                                id: series.id,
                                name: series.name,
                                overview: series.overview,
                                poster_path: series.poster_path,
                                media_type: "tv",
                              });
                            }
                          }}
                          className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-mono ${
                            favoritesIdSet.has(series.id)
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          } text-white`}
                        >
                          {favoritesIdSet.has(series.id)
                            ? "Quitar"
                            : "+ Guardar"}
                        </button>
                      </div>
                    )}

                    {/* Badge SERIE */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded font-mono">
                        SERIE
                      </span>
                    </div>
                  </div>

                  {/* Botón externo removido en Home (solo overlay) */}
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => scrollContainer(seriesRef, "right")}
              className="flex absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-[130%] z-20 items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-2xl border border-white/10 ring-2 ring-white/10 backdrop-blur-md transition transform hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
