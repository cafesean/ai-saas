import { create } from "zustand";
import { Role, Level, RateCard } from "@/types";
import { generateId } from "@/lib/utils";

interface Store {
  roles: Role[];
  levels: Level[];
  rateCards: RateCard[];
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  addLevel: (level: Omit<Level, "id">) => void;
  updateLevel: (id: string, level: Partial<Level>) => void;
  deleteLevel: (id: string) => void;
  addRateCard: (rateCard: Omit<RateCard, "id">) => void;
  updateRateCard: (id: string, rateCard: Partial<RateCard>) => void;
  deleteRateCard: (id: string) => void;
}

// Mock initial data
const mockRoles: Role[] = [
  { id: "1", name: "Developer", description: "Software Developer", roleCode: "DEV" },
  { id: "2", name: "Designer", description: "UI/UX Designer", roleCode: "DES" },
  { id: "3", name: "QA", description: "Quality Assurance", roleCode: "QA" },
];

const mockLevels: Level[] = [
  { id: "1", name: "Specialist I", description: "Entry Level", code: "SP1", roles: [mockRoles[0], mockRoles[2]] },
  { id: "2", name: "Specialist II", description: "Mid Level", code: "SP2", roles: mockRoles },
  { id: "3", name: "Senior Specialist", description: "Senior Level", code: "SSP", roles: mockRoles },
];

// Create a UTC date for mock data
const mockEffectiveDate = new Date(Date.UTC(2024, 0, 1)); // 2024-01-01 in UTC

const mockRateCards: RateCard[] = [
  {
    id: "1",
    name: "Standard Rate 2024",
    effectiveDate: mockEffectiveDate,
    description: "Standard rate card for 2024",
    levelRates: [
      { levelId: "1", monthlyRate: 5000 },
      { levelId: "2", monthlyRate: 7500 },
      { levelId: "3", monthlyRate: 10000 },
    ],
  },
];

export const useStore = create<Store>((set) => ({
  roles: mockRoles,
  levels: mockLevels,
  rateCards: mockRateCards,

  addRole: (role) =>
    set((state) => ({
      roles: [...state.roles, { ...role, id: generateId() }],
    })),

  updateRole: (id, role) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...role } : r)),
    })),

  deleteRole: (id) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
    })),

  addLevel: (level) =>
    set((state) => ({
      levels: [...state.levels, { ...level, id: generateId() }],
    })),

  updateLevel: (id, level) =>
    set((state) => ({
      levels: state.levels.map((l) => (l.id === id ? { ...l, ...level } : l)),
    })),

  deleteLevel: (id) =>
    set((state) => ({
      levels: state.levels.filter((l) => l.id !== id),
    })),

  addRateCard: (rateCard) =>
    set((state) => ({
      rateCards: [...state.rateCards, { ...rateCard, id: generateId() }],
    })),

  updateRateCard: (id, rateCard) =>
    set((state) => ({
      rateCards: state.rateCards.map((rc) => (rc.id === id ? { ...rc, ...rateCard } : rc)),
    })),

  deleteRateCard: (id) =>
    set((state) => ({
      rateCards: state.rateCards.filter((rc) => rc.id !== id),
    })),
})); 