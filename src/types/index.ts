export interface Role {
  id: string;
  name: string;
  description: string;
  roleCode: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  code: string;
  roles: Role[];
}

export interface LevelRate {
  levelId: string;
  monthlyRate: number;
}

export interface RateCard {
  id: string;
  name: string;
  description: string;
  effectiveDate: Date;
  levelRates: LevelRate[];
}

export type RoleLevelRate = {
  role: Role;
  level: Level;
  monthlyRate: number;
}; 