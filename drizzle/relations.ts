import { relations } from "drizzle-orm/relations";
import { group, groupPolicy, levels, levelRates, ratecards, roles, rolePolicy, levelRoles, org, orgUser, user } from "./schema";

export const groupPolicyRelations = relations(groupPolicy, ({one}) => ({
	group: one(group, {
		fields: [groupPolicy.groupId],
		references: [group.id]
	}),
}));

export const groupRelations = relations(group, ({many}) => ({
	groupPolicies: many(groupPolicy),
}));

export const levelRatesRelations = relations(levelRates, ({one}) => ({
	level: one(levels, {
		fields: [levelRates.levelId],
		references: [levels.id]
	}),
	ratecard: one(ratecards, {
		fields: [levelRates.ratecardId],
		references: [ratecards.id]
	}),
}));

export const levelsRelations = relations(levels, ({many}) => ({
	levelRates: many(levelRates),
	levelRoles: many(levelRoles),
}));

export const ratecardsRelations = relations(ratecards, ({many}) => ({
	levelRates: many(levelRates),
}));

export const rolePolicyRelations = relations(rolePolicy, ({one}) => ({
	role: one(roles, {
		fields: [rolePolicy.roleId],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePolicies: many(rolePolicy),
	levelRoles: many(levelRoles),
}));

export const levelRolesRelations = relations(levelRoles, ({one}) => ({
	level: one(levels, {
		fields: [levelRoles.levelId],
		references: [levels.id]
	}),
	role: one(roles, {
		fields: [levelRoles.roleId],
		references: [roles.id]
	}),
}));

export const orgUserRelations = relations(orgUser, ({one}) => ({
	org: one(org, {
		fields: [orgUser.orgId],
		references: [org.id]
	}),
	user: one(user, {
		fields: [orgUser.userId],
		references: [user.id]
	}),
}));

export const orgRelations = relations(org, ({many}) => ({
	orgUsers: many(orgUser),
}));

export const userRelations = relations(user, ({many}) => ({
	orgUsers: many(orgUser),
}));