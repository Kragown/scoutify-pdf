import { create } from 'zustand';
import { PlayerData } from '@/lib/schemas';

interface PlayerStore {
    currentStep: number;
    data: Partial<PlayerData>;
    setStep: (step: number) => void;
    updateData: (newData: Partial<PlayerData>) => void;
    reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
    currentStep: 1,
    data: {},
    setStep: (step) => set({ currentStep: step }),
    updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
    reset: () => set({ currentStep: 1, data: {} }),
}));
