import { create } from 'zustand';
import { TradingPair } from '../domain/TradingPair';

type TradingState = {
  selectedPair: TradingPair | null;
  setSelectedPair: (pair: TradingPair | null) => void;
};

export const useTradingStore = create<TradingState>()((set) => ({
  selectedPair: null,
  setSelectedPair: (pair) => {
    set({ selectedPair: pair });
  },
}));
