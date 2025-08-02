import { createContext, useState, useContext, useEffect } from "react";

type Location = { lat: number; lon: number } | null;

interface LocationContextType {
  location: Location;
  setLocation: (loc: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<Location>(null);

  

  // Load from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lon) {
          setLocation(parsed);
        }
      } catch (error) {
        console.error("Failed to parse saved location", error);
        localStorage.removeItem("userLocation");
      }
    }
  }, []);

  // Save to localStorage when location changes
  useEffect(() => {
    if (location) {
      localStorage.setItem("userLocation", JSON.stringify(location));
    }
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used inside LocationProvider");
  return context;
};
