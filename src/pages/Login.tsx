import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || undefined);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || "auth/unknown";
      const msg = err?.message || "Error de autenticación";
      setError(`${code}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 font-mono">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm mb-1 font-mono">Nombre</label>
              <input
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                type="text"
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1 font-mono">Email</label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-mono">Contraseña</label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm font-mono">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold font-mono"
          >
            {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-300 font-mono">
          {mode === "login" ? (
            <button className="underline" onClick={() => setMode("register")}>
              ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <button className="underline" onClick={() => setMode("login")}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;


