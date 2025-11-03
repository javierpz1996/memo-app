const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Validar que la API_KEY esté configurada
if (!API_KEY) {
  console.error("⚠️ VITE_TMDB_API_KEY no está configurada. Por favor, configura esta variable de entorno en Vercel.");
  throw new Error("API_KEY no configurada. Configura VITE_TMDB_API_KEY en las variables de entorno de Vercel.");
}


//Para buscar todo el contenido, series y peliculas
export const searchMulti = async (query: string) => {
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Error al buscar contenido");
    return res.json();
  };

//Para obtener las series en tendencia
export const getTrendingSeries = async () => {
  const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener series en tendencia");
  return res.json();
};

// Para obtener las películas en tendencia
export const getTrendingMovies = async () => {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener películas en tendencia");
  return res.json();
};

// Para obtener los videos de una película
export const getMovieVideos = async (movieId: number) => {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener videos de la película");
  return res.json();
};

// Para obtener los videos de una serie
export const getTvVideos = async (tvId: number) => {
  const res = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener videos de la serie");
  return res.json();
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// Las mejores películas (top rated)
export const getTopRatedMovies = async () => {
  const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener las mejores películas");
  return res.json();
};

// Las mejores series (top rated)
export const getTopRatedSeries = async () => {
  const res = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener las mejores series");
  return res.json();
};

// Próximas películas (upcoming)
export const getUpcomingMovies = async () => {
  const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener próximas películas");
  return res.json();
};


//Series emitidas hoy (airing today)
export const getAiringTodaySeries = async () => {
  const res = await fetch(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=es-ES`);
  if (!res.ok) throw new Error("Error al obtener series emitidas hoy");
  return res.json();
};