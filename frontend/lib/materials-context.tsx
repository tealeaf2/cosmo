import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Material {
  id: string;
  type: "pdf" | "website" | "video";
  name: string;
  url?: string;
  file?: string;
  enabled: boolean;
}

interface MaterialsContextType {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  addMaterial: (material: Omit<Material, "id" | "enabled">) => void;
  toggleMaterial: (id: string) => void;
  removeMaterial: (id: string) => void;
  getEnabledMaterials: () => Material[];
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);

  const addMaterial = (material: Omit<Material, "id" | "enabled">) => {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
      enabled: true,
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const toggleMaterial = (id: string) => {
    setMaterials(prev => 
      prev.map(material => 
        material.id === id 
          ? { ...material, enabled: !material.enabled }
          : material
      )
    );
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const getEnabledMaterials = () => {
    return materials.filter(material => material.enabled);
  };

  return (
    <MaterialsContext.Provider value={{
      materials,
      setMaterials,
      addMaterial,
      toggleMaterial,
      removeMaterial,
      getEnabledMaterials,
    }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
}