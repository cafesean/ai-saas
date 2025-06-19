import { db } from "@/db";
import type { GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env.mjs";
import bcrypt from 'bcrypt';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
* Options for NextAuth.js used to configure adapters, providers, callbacks,
* etc.
**/
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      console.log('JWT callback triggered:', { trigger, user: user?.email, tokenSub: token.sub });
      
      if (trigger === "signIn" && user) {
        console.log('Processing signIn for user:', user.email);
        token.sub = user.uuid || user.id.toString();
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.picture = user.avatar;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        console.log('JWT token updated:', { sub: token.sub, userId: token.userId, email: token.email });
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      console.log('Session callback triggered:', { sessionUser: session.user?.email, tokenSub: token.sub });
      
      if (token && session.user) {
        session.user.id = token.userId as number;
        session.user.uuid = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.avatar = token.picture as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        
        // Load user roles and permissions from database
        try {
          const userId = token.userId as number;
          
          // Get all user roles across all tenants
          const userRolesData = await db.query.userRoles.findMany({
            where: (userRoles, { eq, and }) => and(
              eq(userRoles.userId, userId),
              eq(userRoles.isActive, true)
            ),
            with: {
              tenant: {
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
            console.warn('No active roles found for user:', userId);
            session.user.roles = [];
            session.user.tenantId = null;
            session.user.availableTenants = [];
            session.user.currentTenant = null;
            return session;
          }

          // Group roles by tenant
          const tenantRoles = userRolesData.reduce((acc, userRole) => {
            const tenantId = userRole.tenantId;
            if (!acc[tenantId]) {
              acc[tenantId] = {
                tenant: userRole.tenant,
                roles: []
              };
            }
            acc[tenantId].roles.push({
              id: userRole.role.id,
              name: userRole.role.name,
              permissions: userRole.role.rolePermissions.map(rp => ({
                name: rp.permission.slug,
                description: rp.permission.description
              }))
            });
            return acc;
          }, {} as Record<number, { tenant: { id: number; name: string }, roles: any[] }>);

          // Determine active tenant (priority: owner role > admin role > first available)
          let activeTenantId: number;
          const ownerTenant = Object.entries(tenantRoles).find(([_, data]) => 
            data.roles.some(role => role.name.toLowerCase() === 'owner')
          );
          const adminTenant = Object.entries(tenantRoles).find(([_, data]) => 
            data.roles.some(role => role.name.toLowerCase() === 'admin')
          );
          
          if (ownerTenant) {
            activeTenantId = parseInt(ownerTenant[0]);
          } else if (adminTenant) {
            activeTenantId = parseInt(adminTenant[0]);
          } else {
            activeTenantId = parseInt(Object.keys(tenantRoles)[0]);
          }

          // Set session data for active tenant
          const activeTenantData = tenantRoles[activeTenantId];
          session.user.tenantId = activeTenantId;
          session.user.currentTenant = activeTenantData.tenant;
          
          // Aggregate all permissions for the active tenant
          const allPermissions = activeTenantData.roles.flatMap(role => role.permissions);
          const uniquePermissions = allPermissions.filter((permission, index, self) => 
            index === self.findIndex(p => p.name === permission.name)
          );

          // Set roles for the active tenant (formatted for withPermission compatibility)
          session.user.roles = [{
            id: activeTenantId, // Use tenant ID as role ID for compatibility
            name: `Multi-Tenant-${activeTenantId}`,
            tenantId: activeTenantId,
            policies: uniquePermissions
          }];

          // Set available tenants for tenant switching
          session.user.availableTenants = Object.entries(tenantRoles).map(([tenantId, data]) => ({
            id: parseInt(tenantId),
            name: data.tenant.name,
            roles: data.roles.map(role => role.name),
            isActive: parseInt(tenantId) === activeTenantId
          }));
          
          console.log('Loaded multi-tenant permissions:', {
            userId,
            activeTenantId,
            activeTenantName: activeTenantData.tenant.name,
            totalTenants: Object.keys(tenantRoles).length,
            activePermissionsCount: uniquePermissions.length,
            availableTenants: session.user.availableTenants.map(t => `${t.name} (${t.roles.join(', ')})`)
          });
          
        } catch (error) {
          console.error('Error loading user permissions in session:', error);
          session.user.roles = [];
          session.user.tenantId = null;
          session.user.availableTenants = [];
          session.user.currentTenant = null;
        }
        
        session.user.orgUser = [];
      }
      
      console.log('Session callback result:', { 
        userId: session.user?.id, 
        email: session.user?.email,
        tenantId: session.user?.tenantId,
        currentTenant: session.user?.currentTenant?.name,
        rolesCount: session.user?.roles?.length || 0,
        permissionsCount: session.user?.roles?.flatMap(r => r.policies).length || 0
      });
      
      return session;
    }
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
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // SECURITY: Secure cookies in production
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
          placeholder: "admin@example.com"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "password"
        }
      },
      async authorize(credentials) {
        // SECURITY: Only log in development to avoid exposing sensitive info in production
        if (process.env.NODE_ENV === 'development') {
          console.log("=== AUTHORIZE FUNCTION CALLED ===");
          console.log("Credentials received:", { 
            email: credentials?.email, 
            passwordLength: credentials?.password?.length 
          });
        }

                  if (!credentials?.email || !credentials?.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log("❌ Missing credentials");
            }
            return null;
          }

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log("🔍 Searching for user:", credentials.email);
          }
          
          // Check if database connection is available
          if (!db) {
            console.error("❌ Database connection not available");
            return null;
          }
          
          const userData = await db.query.users.findFirst({
            where: eq(users.email, credentials.email)
          });

          if (process.env.NODE_ENV === 'development') {
            console.log("User lookup result:", !!userData);
            if (userData) {
              console.log("User data found:", {
                id: userData.id,
                email: userData.email,
                hasPassword: !!userData.password
              });
            }
          }

          if (!userData) {
            if (process.env.NODE_ENV === 'development') {
              console.log("❌ User not found in database");
            }
            // SECURITY: Add timing delay to prevent user enumeration attacks
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
            return null;
          }

          if (!userData.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log("❌ User has no password set");
            }
            // SECURITY: Add timing delay to prevent user enumeration attacks
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log("🔐 Comparing passwords...");
          }
          
          // SECURITY: Use constant-time comparison to prevent timing attacks
          const isValidPassword = await bcrypt.compare(credentials.password, userData.password);
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Password comparison result:", isValidPassword);
          }
          
          if (!isValidPassword) {
            if (process.env.NODE_ENV === 'development') {
              console.log("❌ Invalid password");
            }
            // SECURITY: Add a small delay to prevent timing attacks on user enumeration
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Authentication successful for:", credentials.email);
          }

          const userResult = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
            uuid: userData.uuid || userData.id.toString(),
            username: userData.username || "",
            password: userData.password,
            orgUser: [],
            roles: [],
            avatar: userData.avatar || "",
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
          };

          if (process.env.NODE_ENV === 'development') {
            console.log("🎯 Returning user object:", {
              id: userResult.id,
              email: userResult.email,
              name: userResult.name,
              uuid: userResult.uuid
            });
          }

          return userResult;
        } catch (error) {
          console.error("❌ Auth error:", error);
          console.error("❌ Database error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          return null;
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development', // SECURITY: Only enable debug in development
  logger: {
    error(code, metadata) {
      // Always log errors, but with less detail in production
      if (process.env.NODE_ENV === 'development') {
        console.error("NextAuth Error:", code, metadata);
      } else {
        console.error("NextAuth Error:", code);
      }
    },
    warn(code) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("NextAuth Warning:", code);
      }
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
};

// Helper function to find user by email
const findUserByEmail = async (email: string) => {
  console.log('in findUserByEmail: email', email);
  
  try {
    // Check if database connection is available
    if (!db) {
      console.error('Database connection not available in findUserByEmail');
      return null;
    }

    const userData = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!userData) {
      console.log('User not found for email:', email);
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
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
    };
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
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