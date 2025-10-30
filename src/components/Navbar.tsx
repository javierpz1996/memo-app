import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { Busqueda, setBusqueda, inputValue, setInputValue } = useSearch();
  const { user, logout } = useAuth();

  //estado para el formulario de busqueda
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusqueda(inputValue); // Actualiza el término de búsqueda solo cuando se envía
    setInputValue(""); // Limpia el input
    navigate("/busqueda-personalizada"); // Navega a la página de búsqueda personalizada
  };

  //funcion para cambiar el valor del input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // Solo actualiza el valor del input, no la búsqueda
  };

  console.log("Este es el inputValue", inputValue);
  console.log("Este es el Busqueda", Busqueda);

  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-lg font-mono sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        <div className="flex items-center h-14 sm:h-16 gap-2">
          {/* Botón hamburguesa (solo mobile) */}
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 relative z-50 text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
              />
            </svg>
          </button>

          {/* Logo (mobile y desktop) */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold truncate">
              MemoAPP
            </Link>
          </div>

          {/* Search centrado (ocupa el centro) */}
          <div className="flex-1 flex justify-center">
            <form
              onSubmit={handleSearch}
              className="relative w-full max-w-[520px] px-2"
            >
              <Input
                onChange={handleChange}
                value={inputValue}
                type="text"
                placeholder="Buscar"
                className="pr-10 text-sm"
              />
              <Button
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 px-2 text-gray-300 hover:text-white hover:bg-transparent"
                type="submit"
                variant="ghost"
                size="sm"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </Button>
            </form>
          </div>

          {/* Links de escritorio (ocultos en mobile) */}
          <ul className="hidden sm:flex items-center space-x-6 min-w-0">
            <li>
              <Link
                to="/peliculas"
                className="hover:text-gray-300 font-bold transition-colors"
              >
                Películas
              </Link>
            </li>
            <li>
              <Link
                to="/series"
                className="hover:text-gray-300 font-bold transition-colors"
              >
                Series
              </Link>
            </li>
            <li>
              <Link
                to="/mi-reserva"
                className="hover:text-gray-300 font-bold transition-colors"
              >
                Mi reserva
              </Link>
            </li>
            <li className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-300 hidden sm:block truncate max-w-[160px]">
                    {user.displayName || user.email}
                  </span>
                  <Button
                    onClick={async () => {
                      await logout();
                      navigate("/");
                    }}
                    variant="ghost"
                    size="sm"
                    className="font-bold"
                  >
                    Salir
                  </Button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-gray-300 font-bold transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Menú desplegable mobile (absoluto y más claro) */}
        {open && (
          <div className="sm:hidden absolute left-0 right-0 top-full z-40">
            <div className="bg-gray-800/95 backdrop-blur border-t border-gray-700 shadow-xl pt-2 pb-3 space-y-1">
              <Link
                to="/peliculas"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Películas
              </Link>
              <Link
                to="/series"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Series
              </Link>
              <Link
                to="/mi-reserva"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Mi reserva
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
                >
                  Salir ({user.displayName || user.email})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-gray-700"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
