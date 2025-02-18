import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db/config";
import { rate_cards, level_rates, levels } from "@/db/schema";
import { eq, asc, gte, lte, desc, and, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { getLevelRates } from "@/db/queries";

const levelRateSchema = z.object({
	level_id: z.number(),
	monthly_rate: z.number().positive(),
});

const rateCardSchema = z.object({
	name: z.string().min(1),
	description: z.string().nullable(),
	effective_date: z.date(),
	expire_date: z.date().nullable(),
	level_rates: z.array(levelRateSchema),
});

export const rateCardRouter = createTRPCRouter({
	getAll: publicProcedure.query(async () => {
		const rateCardsWithRates = await db.query.rate_cards.findMany({
			with: {
				level_rates: {
					with: {
						level: true,
					},
				},
			},
			orderBy: asc(rate_cards.effective_date),
		});

		return rateCardsWithRates;
	}),

	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		const rateCard = await db.query.rate_cards.findFirst({
			where: eq(rate_cards.id, input),
			with: {
				level_rates: {
					with: {
						level: true,
					},
				},
			},
		});

		if (!rateCard) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `Rate card with ID ${input} not found`,
			});
		}

		return rateCard;
	}),

	getActiveRateCard: publicProcedure.input(z.date().optional()).query(async ({ input }) => {
		const date = input || new Date();

		const rateCard = await db.query.rate_cards.findFirst({
			where: and(
				lte(rate_cards.effective_date, date),
				or(sql`${rate_cards.expire_date} IS NULL`, gte(rate_cards.expire_date, date))
			),
			with: {
				level_rates: {
					with: {
						level: true,
					},
				},
			},
			orderBy: desc(rate_cards.effective_date),
		});

		if (!rateCard) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `No active rate card found for date ${date.toISOString()}`,
			});
		}

		return rateCard;
	}),

	getLevelRates: publicProcedure
		.input(
			z.object({
				ratecardId: z.number(),
			})
		)
		.query(async ({ input }) => {
			const rates = await getLevelRates(input.ratecardId);
			return rates;
		}),
    
	create: publicProcedure.input(rateCardSchema).mutation(async ({ input }) => {
		const { level_rates: levelRates, ...rateCardData } = input;

		return await db.transaction(async (tx) => {
			// Create rate card
			const [newRateCard] = await tx
				.insert(rate_cards)
				.values({
					...rateCardData,
					uuid: uuidv4(),
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning();

			if (!newRateCard) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create rate card",
				});
			}

			if (levelRates.length > 0) {
				// Create level rate associations
				await tx.insert(level_rates).values(
					levelRates.map((rate) => ({
						uuid: uuidv4(),
						ratecard_id: newRateCard.id,
						level_id: rate.level_id,
						monthly_rate: rate.monthly_rate,
						created_at: new Date(),
						updated_at: new Date(),
					}))
				);
			}

			// Return complete rate card with rates
			const completeRateCard = await tx.query.rate_cards.findFirst({
				where: eq(rate_cards.id, newRateCard.id),
				with: {
					level_rates: {
						with: {
							level: true,
						},
					},
				},
			});

			if (!completeRateCard) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create rate card",
				});
			}

			return completeRateCard;
		});
	}),

	update: publicProcedure
		.input(
			z.object({
				id: z.number(),
				data: rateCardSchema.partial(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { data } = input;
			const { level_rates: levelRates, ...rateCardData } = data;

			return await db.transaction(async (tx) => {
				// Update rate card
				const [updatedRateCard] = await tx
					.update(rate_cards)
					.set({
						...rateCardData,
						updated_at: new Date(),
					})
					.where(eq(rate_cards.id, input.id))
					.returning();

				if (!updatedRateCard) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Rate card with ID ${input.id} not found`,
					});
				}

				// Update level rates if provided
				if (levelRates) {
					// Delete existing rates
					await tx.delete(level_rates).where(eq(level_rates.ratecard_id, updatedRateCard.id));

					if (levelRates.length > 0) {
						// Create new rates
						await tx.insert(level_rates).values(
							levelRates.map((rate) => ({
								uuid: uuidv4(),
								ratecard_id: updatedRateCard.id,
								level_id: rate.level_id,
								monthly_rate: rate.monthly_rate,
								created_at: new Date(),
								updated_at: new Date(),
							}))
						);
					}
				}

				// Return complete rate card with rates
				const completeRateCard = await tx.query.rate_cards.findFirst({
					where: eq(rate_cards.id, updatedRateCard.id),
					with: {
						level_rates: {
							with: {
								level: true,
							},
						},
					},
				});

				if (!completeRateCard) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update rate card",
					});
				}

				return completeRateCard;
			});
		}),

	delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
		return await db.transaction(async (tx) => {
			// Delete level rates first
			await tx.delete(level_rates).where(eq(level_rates.ratecard_id, input));

			// Delete rate card
			const [rateCard] = await tx.delete(rate_cards).where(eq(rate_cards.id, input)).returning();

			if (!rateCard) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Rate card with ID ${input} not found`,
				});
			}

			return rateCard;
		});
	}),
});
