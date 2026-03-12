import { create } from 'zustand';

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

export interface AppState {
  vitals: VitalSigns;
  isSimulating: boolean;
  emergencyContacts: EmergencyContact[];
  thresholds: {
    tempMax: number;
    hrMax: number;
  };
  setVitals: (vitals: Partial<VitalSigns>) => void;
  toggleSimulation: () => void;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateThresholds: (thresholds: { tempMax: number; hrMax: number }) => void;
}

// In a real environment we would use Zustand, but for this context we'll use a simplified pattern or react state.
// Since I can't install zustand, I will create a React Context instead.
