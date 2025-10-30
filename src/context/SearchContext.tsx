import { createContext, useContext, useState } from "react";

const SearchContext = createContext<any>(null);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [inputValue, setInputValue] = useState(""); // Valor del input
  const [Busqueda, setBusqueda] = useState(""); // Término de búsqueda real
  return (
    <SearchContext.Provider
      value={{ Busqueda, setBusqueda, inputValue, setInputValue }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
