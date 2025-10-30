import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import BusquedaPersonalizada from "./pages/BusquedaPersonalizada";
import Peliculas from "./pages/Peliculas";
import Series from "./pages/Series";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import MiReserva from "./pages/MiReserva";

const App = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/busqueda-personalizada"
                element={<BusquedaPersonalizada />}
              />
              <Route path="/peliculas" element={<Peliculas />} />
              <Route path="/series" element={<Series />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mi-reserva" element={<MiReserva />} />
            </Routes>
          </main>
        </div>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
