import { create } from "zustand";

export interface HeroSceneState {
  timeOfDay: number;
  scrollProgress: number;
  /** Monotonic scene clock (seconds), advanced by HeroFrameLoop. */
  elapsed: number;
  isNight: boolean;
  goldenHourBoost: number;
  windDirection: number;
  lanternIntensity: number;
  weatherState: number;
  isMobile: boolean;
  setTimeOfDay: (t: number) => void;
  setScrollProgress: (p: number) => void;
  setElapsed: (elapsed: number) => void;
  setDerived: (derived: {
    isNight: boolean;
    goldenHourBoost: number;
    windDirection: number;
    lanternIntensity: number;
  }) => void;
  setWeatherState: (w: number) => void;
  setIsMobile: (m: boolean) => void;
}

export const useHeroStore = create<HeroSceneState>((set) => ({
  timeOfDay: 10,
  scrollProgress: 0,
  elapsed: 0,
  isNight: false,
  goldenHourBoost: 0,
  windDirection: 1,
  lanternIntensity: 0,
  weatherState: 0,
  isMobile: false,
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setElapsed: (elapsed) => set({ elapsed }),
  setDerived: (derived) => set(derived),
  setWeatherState: (weatherState) => set({ weatherState }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));
