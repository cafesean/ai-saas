import { db } from "@/db";
import type { GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, type User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env.mjs";
import * as bcrypt from 'bcrypt';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Extended types for NextAuth - properly extending base types
interface ExtendedUser extends User {
  id: string; // NextAuth expects string ID
  uuid: string;
  email: string;
  name: string;
  username: string;
  password: string;
  orgUser: never[];
  roles: never[];
  avatar: string;
  firstName: string;
  lastName: string;
}

interface ExtendedJWTToken extends JWT {
  userId: number; // Internal DB ID as number
  username: string;
  firstName: string;
  lastName: string;
  sessionTimeoutPreference?: number; // Session timeout in minutes (EPIC-6)
  lastActivity?: number; // Timestamp of last activity (EPIC-6)
}

interface ExtendedSessionUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  firstName: string;
  lastName: string;
  orgUser: never[];
  roles: Array<{
    id: number;
    name: string;
    orgId: number;
    policies: Array<{ name: string; description?: string }>;
  }>;
  orgId: number | null;
  currentOrg: { id: number; name: string } | null;
  availableOrgs: Array<{
    id: number;
    name: string;
    roles: string[];
    isActive: boolean;
  }>;
}

// Type for org roles data structure
interface OrgRoleData {
  org: { id: number; name: string };
  roles: Array<{
    id: number;
    name: string;
    permissions: Array<{ name: string; description?: string }>;
  }>;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      console.log("JWT callback triggered:", {
        trigger,
        user: user?.email,
        tokenSub: token.sub,
      });

      if (trigger === "signIn" && user) {
        // Safe type assertion with unknown intermediate
        const extendedUser = user as unknown as ExtendedUser;
        console.log('Processing signIn for user:', extendedUser.email);
        token.sub = extendedUser.uuid || extendedUser.id.toString();
        (token as ExtendedJWTToken).userId = parseInt(extendedUser.id); // Convert string ID to number for DB
        token.email = extendedUser.email;
        token.name = extendedUser.name;
        (token as ExtendedJWTToken).username = extendedUser.username;
        token.picture = extendedUser.avatar;
        (token as ExtendedJWTToken).firstName = extendedUser.firstName;
        (token as ExtendedJWTToken).lastName = extendedUser.lastName;
        
        // Load user's session timeout preference (EPIC-6)
        try {
          const userData = await db.query.users.findFirst({
            where: eq(users.id, parseInt(extendedUser.id)),
            columns: { sessionTimeoutPreference: true }
          });
          (token as ExtendedJWTToken).sessionTimeoutPreference = userData?.sessionTimeoutPreference || 1440; // Default 1 day
          (token as ExtendedJWTToken).lastActivity = Date.now();
          console.log('Loaded session preference:', userData?.sessionTimeoutPreference);
        } catch (error) {
          console.error('Error loading session preference:', error);
          (token as ExtendedJWTToken).sessionTimeoutPreference = 1440; // Default 1 day
          (token as ExtendedJWTToken).lastActivity = Date.now();
        }
        
        console.log('JWT token updated:', { sub: token.sub, userId: (token as ExtendedJWTToken).userId, email: token.email });
      }
      
      // Check session timeout on each token refresh (EPIC-6)
      const extendedToken = token as ExtendedJWTToken;
      const now = Date.now();
      const sessionTimeoutMs = (extendedToken.sessionTimeoutPreference || 1440) * 60 * 1000; // Convert minutes to milliseconds
      const lastActivity = extendedToken.lastActivity || now;
      
      if (now - lastActivity > sessionTimeoutMs) {
        console.log('Session expired due to user preference timeout');
        return null; // This will force logout
      }
      
      // Update last activity timestamp
      extendedToken.lastActivity = now;
      
      return token;
    },
    session: async ({ session, token }) => {
      console.log("Session callback triggered:", {
        sessionUser: session.user?.email,
        tokenSub: token.sub,
      });

      if (token && session.user) {
        // Safe type assertion with unknown intermediate
        const extendedToken = token as unknown as ExtendedJWTToken;
        const extendedUser = session.user as unknown as ExtendedSessionUser;
        
        extendedUser.id = extendedToken.userId;
        extendedUser.uuid = extendedToken.sub as string;
        extendedUser.email = extendedToken.email as string;
        extendedUser.name = extendedToken.name as string;
        extendedUser.username = extendedToken.username;
        extendedUser.avatar = extendedToken.picture as string;
        extendedUser.firstName = extendedToken.firstName;
        extendedUser.lastName = extendedToken.lastName;
        
        // Load user roles and permissions from database
        try {
          const userId = extendedToken.userId;
          
          // Get all user roles across all orgs
          const userRolesData = await db.query.userRoles.findMany({
            where: (userRoles, { eq, and }) => and(
              eq(userRoles.userId, userId),
              eq(userRoles.isActive, true)
            ),
            with: {
              org: {
                columns: { id: true, name: true }
              },
              role: {
                with: {
                  rolePermissions: {
                    with: {
                      permission: true
                    }
                  }
                }
              }
            }
          });

          if (userRolesData.length === 0) {
            console.warn('No active roles found for user:', userId, '- applying fallback session data');
            
            // EPIC-6 FIX: Provide fallback session data for users without RBAC roles
            extendedUser.roles = [{
              id: 1,
              name: 'basic_user',
              orgId: 1,
              policies: [
                { name: 'user:read_own_profile' },
                { name: 'user:update_own_profile' },
                { name: 'user:manage_own_session' }
              ]
            }];
            extendedUser.orgId = 1;
            extendedUser.availableOrgs = [{
              id: 1,
              name: 'Default Organization',
              roles: ['basic_user'],
              isActive: true
            }];
            extendedUser.currentOrg = {
              id: 1,
              name: 'Default Organization'
            };
            
            extendedUser.orgUser = [];
            console.log('Applied fallback session for user without roles:', extendedUser.email);
            return session;
          }

          // Group roles by org with proper typing
          const orgRoles = userRolesData.reduce((acc, userRole) => {
            const orgId = userRole.orgId;
            if (!acc[orgId]) {
              acc[orgId] = {
                org: userRole.org,
                roles: []
              };
            }
            acc[orgId].roles.push({
              id: userRole.role.id,
              name: userRole.role.name,
              permissions: userRole.role.rolePermissions.map(rp => ({
                name: rp.permission.slug,
                description: rp.permission.description || undefined
              }))
            });
            return acc;
          }, {} as Record<number, OrgRoleData>);

          // Determine active org (priority: owner role > admin role > first available)
          let activeOrgId: number;
          const ownerOrg = Object.entries(orgRoles).find(([_, data]: [string, OrgRoleData]) => 
            data.roles.some(role => role.name.toLowerCase() === 'owner')
          );
          const adminOrg = Object.entries(orgRoles).find(([_, data]: [string, OrgRoleData]) => 
            data.roles.some(role => role.name.toLowerCase() === 'admin')
          );
          
          if (ownerOrg) {
            activeOrgId = parseInt(ownerOrg[0]);
          } else if (adminOrg) {
            activeOrgId = parseInt(adminOrg[0]);
          } else {
            const firstOrgKey = Object.keys(orgRoles)[0];
            if (!firstOrgKey) {
              throw new Error('No valid org found');
            }
            activeOrgId = parseInt(firstOrgKey);
          }

          // Set session data for active org
          const activeOrgData = orgRoles[activeOrgId];
          if (!activeOrgData) {
            throw new Error('Active org data not found');
          }
          
          extendedUser.orgId = activeOrgId;
          extendedUser.currentOrg = activeOrgData.org;
          
          // Aggregate all permissions for the active org
          const allPermissions = activeOrgData.roles.flatMap(role => role.permissions);
          const uniquePermissions = allPermissions.filter((permission, index, self) => 
            index === self.findIndex(p => p.name === permission.name)
          );

          // Set roles for the active org (formatted for withPermission compatibility)
          extendedUser.roles = [{
            id: activeOrgId, // Use org ID as role ID for compatibility
            name: `Multi-Org-${activeOrgId}`,
            orgId: activeOrgId,
            policies: uniquePermissions
          }];

          // Set available orgs for org switching
          extendedUser.availableOrgs = Object.entries(orgRoles).map(([orgId, data]: [string, OrgRoleData]) => ({
            id: parseInt(orgId),
            name: data.org.name,
            roles: data.roles.map(role => role.name),
            isActive: parseInt(orgId) === activeOrgId
          }));
          
          console.log('Loaded multi-org permissions:', {
            userId,
            activeOrgId,
            activeOrgName: activeOrgData.org.name,
            totalOrgs: Object.keys(orgRoles).length,
            activePermissionsCount: uniquePermissions.length,
            availableOrgs: extendedUser.availableOrgs.map((t: any) => `${t.name} (${t.roles.join(', ')})`)
          });
          
        } catch (error) {
          console.error('Error loading user permissions in session:', error);
          
          // EPIC-6 FIX: Provide fallback session data for users without RBAC setup
          // This ensures the protectedProcedure middleware works for basic operations
          extendedUser.roles = [{
            id: 1,
            name: 'basic_user',
            orgId: 1,
            policies: [
              { name: 'user:read_own_profile' },
              { name: 'user:update_own_profile' },
              { name: 'user:manage_own_session' }
            ]
          }];
          extendedUser.orgId = 1;
          extendedUser.availableOrgs = [{
            id: 1,
            name: 'Default Organization',
            roles: ['basic_user'],
            isActive: true
          }];
          extendedUser.currentOrg = {
            id: 1,
            name: 'Default Organization'
          };
          
          console.log('Applied fallback session data for user:', extendedUser.email);
        }
        
        extendedUser.orgUser = [];
      }
      
      const extendedUser = session.user as unknown as ExtendedSessionUser;
      console.log('Session callback result:', { 
        userId: extendedUser?.id, 
        email: extendedUser?.email,
        orgId: extendedUser?.orgId,
        currentOrg: extendedUser?.currentOrg?.name,
        rolesCount: extendedUser?.roles?.length || 0,
        permissionsCount: extendedUser?.roles?.flatMap((r: any) => r.policies).length || 0
      });

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:
          process.env.NEXTAUTH_COOKIE_SECURE === "true" ||
          !process.env.NEXTAUTH_COOKIE_SECURE,
      },
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // SECURITY: Reduced from 30 days to 1 day for better security
    updateAge: 60 * 60, // Update session every hour
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        // SECURITY: Only log in development to avoid exposing sensitive info in production
        if (process.env.NODE_ENV === "development") {
          console.log("=== AUTHORIZE FUNCTION CALLED ===");
          console.log("Credentials received:", {
            email: credentials?.email,
            passwordLength: credentials?.password?.length,
          });
        }

        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log("❌ Missing credentials");
          }
          return null;
        }

        try {
          if (process.env.NODE_ENV === "development") {
            console.log("🔍 Searching for user:", credentials.email);
          }

          // Check if database connection is available
          if (!db) {
            console.error("❌ Database connection not available");
            return null;
          }

          const userData = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (process.env.NODE_ENV === "development") {
            console.log("User lookup result:", !!userData);
            if (userData) {
              console.log("User data found:", {
                id: userData.id,
                email: userData.email,
                hasPassword: !!userData.password,
              });
            }
          }

          if (!userData) {
            if (process.env.NODE_ENV === "development") {
              console.log("❌ User not found in database");
            }
            // SECURITY: Add timing delay to prevent user enumeration attacks
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 100 + 50),
            );
            return null;
          }

          if (!userData.password) {
            if (process.env.NODE_ENV === "development") {
              console.log("❌ User has no password set");
            }
            // SECURITY: Add timing delay to prevent user enumeration attacks
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 100 + 50),
            );
            return null;
          }

          if (process.env.NODE_ENV === "development") {
            console.log("🔐 Comparing passwords...");
          }

          // SECURITY: Use constant-time comparison to prevent timing attacks
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            userData.password,
          );

          if (process.env.NODE_ENV === "development") {
            console.log("Password comparison result:", isValidPassword);
          }

          if (!isValidPassword) {
            if (process.env.NODE_ENV === "development") {
              console.log("❌ Invalid password");
            }
            // SECURITY: Add a small delay to prevent timing attacks on user enumeration
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 100 + 50),
            );
            return null;
          }

          if (process.env.NODE_ENV === "development") {
            console.log("✅ Authentication successful for:", credentials.email);
          }

          // Return User-compatible object (with string ID as NextAuth expects)
          const userResult = {
            id: userData.id.toString(), // Convert to string for NextAuth compatibility
            email: userData.email,
            name: userData.name || userData.email,
            uuid: userData.uuid || userData.id.toString(),
            username: userData.username || "",
            password: userData.password,
            orgUser: [],
            roles: [],
            avatar: userData.avatar || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
          };

          if (process.env.NODE_ENV === "development") {
            console.log("🎯 Returning user object:", {
              id: userResult.id,
              email: userResult.email,
              name: userResult.name,
              uuid: userResult.uuid,
            });
          }

          return userResult;
        } catch (error) {
          console.error("❌ Auth error:", error);
          console.error("❌ Database error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
          return null;
        }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development", // SECURITY: Only enable debug in development
  logger: {
    error(code, metadata) {
      // Always log errors, but with less detail in production
      if (process.env.NODE_ENV === "development") {
        console.error("NextAuth Error:", code, metadata);
      } else {
        console.error("NextAuth Error:", code);
      }
    },
    warn(code) {
      if (process.env.NODE_ENV === "development") {
        console.warn("NextAuth Warning:", code);
      }
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
};

// Helper function to find user by email
const findUserByEmail = async (email: string) => {
  console.log("in findUserByEmail: email", email);

  try {
    // Check if database connection is available
    if (!db) {
      console.error("Database connection not available in findUserByEmail");
      return null;
    }

    const userData = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!userData) {
      console.log("User not found for email:", email);
      return null;
    }

    return {
      id: userData.id,
      uuid: userData.uuid || "",
      name: userData.name || "",
      username: userData.username || "",
      email: email,
      password: userData.password,
      avatar: userData.avatar,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
    };
  } catch (error) {
    console.error("Error in findUserByEmail:", error);
    return null;
  }
};

/**
 * Wrapper for `getServerSession`
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
