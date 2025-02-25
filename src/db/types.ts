import { InferModel } from "drizzle-orm";
import { roles, levels, level_roles, rate_cards, level_rates } from "./schema";

// Define types for each model
export type DbRole = InferModel<typeof roles>;
// export type NewDbRole = InferModel<typeof roles, 'insert'>;

export interface NewDbRole {
	uuid: string;
	name: string;
	description: string | null;
	role_code: string;
	created_at: Date;
	updated_at: Date;
}

export type DbLevel = InferModel<typeof levels> & {
	roles: DbRole[];
};
// export type NewDbLevel = InferModel<typeof levels, "insert">;

export interface NewDbLevel extends Omit<Level, "id"> {
	uuid: string;
	created_at: Date;
	updated_at: Date;
	roles: Role[];
}

export type DbLevelRole = InferModel<typeof level_roles>;
export type NewDbLevelRole = InferModel<typeof level_roles, "insert">;

export type DbRateCard = InferModel<typeof rate_cards>;
// export type NewDbRateCard = InferModel<typeof rate_cards, "insert">;

export interface NewDbRateCard {
	uuid: string;
	name: string;
	description: string | null;
	effective_date: Date;
	expire_date: Date | undefined;
	status: string | null;
	created_at: Date;
	updated_at: Date;
}

export type DbLevelRate = InferModel<typeof level_rates>;
export type NewDbLevelRate = InferModel<typeof level_rates, "insert">;

export interface Role {
	id: number;
	uuid: string;
	name: string;
	description: string | null;
	role_code: string;
	created_at: Date;
	updated_at: Date;
}

export interface Level {
	id: number;
	uuid: string;
	name: string;
	description: string | null;
	code: string;
	created_at: Date;
	updated_at: Date;
	roles: Role[];
}

export interface RateCard {
	id: number;
	uuid: string;
	name: string;
	description: string | null;
	effective_date: Date;
	expire_date?: Date;
	created_at: Date;
	updated_at: Date;
	levelRates?: Array<{
		levelId: number;
		monthlyRate: string;
	}>;
}

export interface LevelRate {
	id: number;
	level_id: number;
	ratecard_id: number;
	monthly_rate: number;
	created_at: Date;
	updated_at: Date;
}

export interface LevelRole {
	level_id: number;
	role_id: number;
	role?: Role;
}
