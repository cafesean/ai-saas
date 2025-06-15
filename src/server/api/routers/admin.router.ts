import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, withPermission } from "../trpc";
import { db } from "@/db/config";
import { roles, permissions, rolePermissions, userRoles } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
	debugContext: publicProcedure.query(async ({ ctx }) => {
		return {
			hasSession: !!ctx.session,
			hasUser: !!ctx.session?.user,
			userId: ctx.session?.user?.id || null,
			tenantId: null, // TODO: Fix tenantId access based on actual OrgUser structure
			nodeEnv: process.env.NODE_ENV,
			mockUserId: process.env.NEXT_PUBLIC_MOCK_USER_ID,
		};
	}),

	seedRBAC: protectedProcedure.mutation(async ({ ctx }) => {
		// Rate limiting for admin operations
		try {
			const { checkTRPCRateLimit } = await import("@/lib/rate-limit");
			await checkTRPCRateLimit(ctx.session?.user?.id, "admin.seedRBAC");
		} catch (error) {
			if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
				throw error;
			}
			console.error("Rate limiting error in admin.seedRBAC:", error);
		}

		try {
			console.log("🚀 Starting RBAC seeding via tRPC...");

			// Insert basic roles
			const rolesData = [
				{
					name: "owner",
					description: "Full system ownership with all permissions",
					isSystemRole: true,
					isActive: true,
				},
				{
					name: "admin",
					description: "Administrative access with most permissions",
					isSystemRole: true,
					isActive: true,
				},
				{ name: "manager", description: "Management-level access", isSystemRole: true, isActive: true },
				{ name: "user", description: "Standard user access", isSystemRole: true, isActive: true },
			];

			for (const roleData of rolesData) {
				await db.insert(roles).values(roleData).onConflictDoNothing();
			}

			// Insert essential permissions
			const permissionsData = [
				{
					slug: "admin:full_access",
					name: "Full Admin Access",
					description: "Complete administrative control",
					category: "admin",
					isActive: true,
				},
				{
					slug: "workflow:create",
					name: "Create Workflow",
					description: "Create new workflows",
					category: "workflow",
					isActive: true,
				},
				{
					slug: "workflow:read",
					name: "View Workflow",
					description: "View workflow details",
					category: "workflow",
					isActive: true,
				},
				{
					slug: "workflow:update",
					name: "Edit Workflow",
					description: "Edit existing workflows",
					category: "workflow",
					isActive: true,
				},
				{
					slug: "workflow:delete",
					name: "Delete Workflow",
					description: "Delete workflows",
					category: "workflow",
					isActive: true,
				},
				{
					slug: "model:create",
					name: "Create Model",
					description: "Upload and create new AI models",
					category: "model",
					isActive: true,
				},
				{
					slug: "model:read",
					name: "View Model",
					description: "View model details",
					category: "model",
					isActive: true,
				},
				{
					slug: "model:update",
					name: "Edit Model",
					description: "Edit model metadata",
					category: "model",
					isActive: true,
				},
				{
					slug: "model:delete",
					name: "Delete Model",
					description: "Delete AI models",
					category: "model",
					isActive: true,
				},
				{
					slug: "model:inference",
					name: "Run Inference",
					description: "Execute model inference requests",
					category: "model",
					isActive: true,
				},
				{
					slug: "file:upload",
					name: "Upload Files",
					description: "Upload files to the system",
					category: "file",
					isActive: true,
				},
				{
					slug: "file:read",
					name: "Read Files",
					description: "Access and download files",
					category: "file",
					isActive: true,
				},
				{
					slug: "file:delete",
					name: "Delete Files",
					description: "Delete files from the system",
					category: "file",
					isActive: true,
				},
				{
					slug: "file:manage_s3",
					name: "Manage S3 Storage",
					description: "Manage S3 storage operations",
					category: "file",
					isActive: true,
				},
				{
					slug: "knowledge_base:create",
					name: "Create Knowledge Base",
					description: "Create new knowledge bases",
					category: "knowledge_base",
					isActive: true,
				},
				{
					slug: "knowledge_base:read",
					name: "View Knowledge Base",
					description: "Access knowledge base content",
					category: "knowledge_base",
					isActive: true,
				},
				{
					slug: "knowledge_base:update",
					name: "Edit Knowledge Base",
					description: "Edit knowledge base content",
					category: "knowledge_base",
					isActive: true,
				},
				{
					slug: "knowledge_base:delete",
					name: "Delete Knowledge Base",
					description: "Delete knowledge bases",
					category: "knowledge_base",
					isActive: true,
				},
				{
					slug: "knowledge_base:chat",
					name: "Chat with Knowledge Base",
					description: "Chat with knowledge base AI",
					category: "knowledge_base",
					isActive: true,
				},
				{
					slug: "knowledge_base:embed",
					name: "Embed Documents",
					description: "Process document embeddings",
					category: "knowledge_base",
					isActive: true,
				},
			];

			for (const permData of permissionsData) {
				await db.insert(permissions).values(permData).onConflictDoNothing();
			}

			// Get all roles and permissions for mapping
			const allRoles = await db.select().from(roles);
			const allPermissions = await db.select().from(permissions);

			// Assign all permissions to owner role
			const ownerRole = allRoles.find((r) => r.name === "owner");
			if (ownerRole) {
				for (const permission of allPermissions) {
					await db
						.insert(rolePermissions)
						.values({
							roleId: ownerRole.id,
							permissionId: permission.id,
						})
						.onConflictDoNothing();
				}
			}

			// Assign user ID 1 to owner role
			if (ownerRole) {
				await db
					.insert(userRoles)
					.values({
						userId: 1,
						roleId: ownerRole.id,
						tenantId: 1,
						isActive: true,
					})
					.onConflictDoNothing();
			}

			const finalRoles = await db.select().from(roles);
			const finalPermissions = await db.select().from(permissions);
			const finalMappings = await db.select().from(rolePermissions);
			const finalUserRoles = await db.select().from(userRoles);

			return {
				success: true,
				message: "RBAC seeding completed successfully!",
				summary: {
					roles: finalRoles.length,
					permissions: finalPermissions.length,
					roleMappings: finalMappings.length,
					userRoles: finalUserRoles.length,
				},
			};
		} catch (error) {
			console.error("❌ Error during RBAC seeding:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to seed RBAC data",
			});
		}
	}),
});
