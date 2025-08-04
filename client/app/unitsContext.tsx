import React, { createContext, useContext, useState, ReactNode } from "react";

type Units = "Celsius" | "Farenheit";

interface UnitsContextType {
  unit: Units;
  setUnit: React.Dispatch<React.SetStateAction<Units>>;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export const UnitsProvider = ({ children }: { children: ReactNode }) => {
  const [unit, setUnit] = useState<Units>("Celsius");

  return (
    <UnitsContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
};
