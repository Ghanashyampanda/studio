"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';

export interface VitalSigns {
  bodyTemperature: number;
  heartRate: number;
  activityLevel: ActivityLevel;
  humidity: number;
  heatIndex: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  contact: string;
  type: 'phone' | 'email';
}

interface AppContextType {
  vitals: VitalSigns;
  isSimulating: boolean;
  emergencyContacts: EmergencyContact[];
  thresholds: {
    tempMax: number;
    hrMax: number;
  };
  setVitals: (vitals: Partial<VitalSigns>) => void;
  toggleSimulation: (val?: boolean) => void;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateThresholds: (thresholds: { tempMax: number; hrMax: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [vitals, setVitalsState] = useState<VitalSigns>({
    bodyTemperature: 37.0,
    heartRate: 72,
    activityLevel: 'light',
    humidity: 45,
    heatIndex: 32,
  });

  const [isSimulating, setIsSimulating] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'John Doe', contact: '555-0101', type: 'phone' },
  ]);
  const [thresholds, setThresholds] = useState({
    tempMax: 39.5,
    hrMax: 140,
  });

  const setVitals = (newVitals: Partial<VitalSigns>) => {
    setVitalsState(prev => ({ ...prev, ...newVitals }));
  };

  const toggleSimulation = (val?: boolean) => {
    setIsSimulating(prev => val !== undefined ? val : !prev);
  };

  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    setEmergencyContacts(prev => [...prev, { ...contact, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  const updateThresholds = (newThresholds: { tempMax: number; hrMax: number }) => {
    setThresholds(newThresholds);
  };

  // Simulate data flux
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setVitalsState(prev => ({
        ...prev,
        bodyTemperature: Math.min(41, Math.max(36, prev.bodyTemperature + (Math.random() - 0.45) * 0.1)),
        heartRate: Math.min(180, Math.max(50, prev.heartRate + Math.floor((Math.random() - 0.45) * 4))),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <AppContext.Provider value={{
      vitals,
      isSimulating,
      emergencyContacts,
      thresholds,
      setVitals,
      toggleSimulation,
      addContact,
      removeContact,
      updateThresholds
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
