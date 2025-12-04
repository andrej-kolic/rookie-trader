import { create } from 'zustand';
import { TradingPair } from '../domain/TradingPair';

type TradingState = {
  selectedPair: TradingPair | null;
  setSelectedPair: (pair: TradingPair | null) => void;
};

export const useTradingStore = create<TradingState>()((set, get) => ({
  selectedPair: null,
  setSelectedPair: (pair) => {
    // Only update if the pair ID actually changed to prevent unnecessary rerenders
    const currentPair = get().selectedPair;
    if (currentPair?.id !== pair?.id) {
      set({ selectedPair: pair });
    }
  },
}));
