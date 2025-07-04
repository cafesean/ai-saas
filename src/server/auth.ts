import { Role } from '@/constants/role';
import { db } from "@/db/config";
import type { GetServerSidePropsContext } from "next";
import { Session, User, getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { ISODateString } from "next-auth/src/core/types";
import { env } from "@/env.mjs";
// import { role } from "@prisma/client";
import { SessionRole } from "@/framework/types/role";
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt-nodejs';
import crypto from "crypto";
import { DefaultJWT } from "next-auth/jwt";
import slugify from "slugify";

// Temporary Prisma client import for compatibility
// TODO: Migrate completely to Drizzle ORM
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
* Module augmentation for `next-auth` types.
* Allows us to add custom properties to the `session` object and keep type
* safety.
*
* @see https://next-auth.js.org/getting-started/typescript#module-augmentation
**/
declare module "next-auth" {

  type OrgUser = {
    org_id: number;
    user_id: number;
    role: string;
  };

  export interface Session {
    user: {
      id: number; //session id = user uuid
      uuid: string;
      name: string;
      username: string;
      email: any;
      roles: SessionRole[];
      avatar: string;
      orgUser: OrgUser[];
      firstName: string;
      lastName: string;
      tenantId: number;
      // ...other properties
      // role: UserRole;
    };
    expires: ISODateString;
  }


  export interface User {
    id: number; // user id
    uuid: string;
    name: string;
    username: string;
    email: string | null;
    password: string | null;
    orgUser: OrgUser[] | null;
    roles: any[] | null;
    avatar: string | null;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  export interface JWT extends DefaultJWT {
    email: any
    roles: any
  }
}

/**
* Options for NextAuth.js used to configure adapters, providers, callbacks,
* etc.
*
* @see https://next-auth.js.org/configuration/options
**/
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      switch (trigger) {
        case "signIn": {
          console.log('jwt in signIn:', trigger, user, token);
          const databaseUser = await findUserByEmail(user?.email ?? token.email["default"]);
          // It will be always available, because already validated on signIn
          if (!databaseUser) {
            throw new TRPCError({
              code: 'UNAUTHORIZED'
            })
          }

          token.sub = databaseUser.uuid
          token.userId = databaseUser.id
          token.email = databaseUser.email
          token.name = databaseUser.name
          token.username = databaseUser.username
          token.picture = databaseUser.avatar
          token.roles = databaseUser.roles
          token.orgUser = databaseUser.orgUser
          token.firstName = databaseUser.firstName
          token.lastName = databaseUser.lastName
          break;
        }
        case "update": {
          // console.log('jwt in update:', trigger, user, token);
          const databaseUser = await findUserByEmail(token.email);
          // It will be always available, because already validated on signIn
          if (!databaseUser) {
            throw new TRPCError({
              code: 'NOT_FOUND'
            })
          }
          // console.log('xx in jwt update', databaseUser)
          // if(session?.name) {
          token.sub = databaseUser.uuid
          token.userId = databaseUser.id
          token.email = databaseUser.email
          token.name = databaseUser.name
          token.username = databaseUser.username
          token.picture = databaseUser.avatar
          token.roles = databaseUser.roles
          token.orgUser = databaseUser.orgUser
          token.firstName = databaseUser.firstName
          token.lastName = databaseUser.lastName
          // }
        }
      }

      return token
    },
    signIn: async ({ profile, credentials, account, user }) => {
      if (account?.provider !== "credentials" && profile) {
        let user = await findUserByEmail(profile.email || '');
        // Create new user for facebook provider
        // let user;
        switch (Object.keys(user).length) {
          case 0: {
            // User object is empty
            // Handle the case where the user object is empty

            const newUser = await db.user.create({
              data: {
                email: {
                  default: profile.email
                },
                name: profile.name,
                role_id: [Role.Member],
                avatar: `https://ui-avatars.com/api/?name=${profile.name}&size=256&background=370B7D&color=FFFFFF&font-size=0.4`
              }
            })
            // const org = await prisma.org.create({
            //   data: {
            //     plan_id: OrgDefaultPlanID.Free,
            //     type: OrgType.Individual,
            //     uuid: crypto.randomUUID(),
            //     name: `${profile.name}`,
            //     slug: slugify(profile.name || ''),
            //     status: OrgStatus.Verified
            //   }
            // });
            // const newOrgUserData = await prisma.org_user.create({
            //   data: {
            //     org_id: org.id,
            //     user_id: newUser.id,
            //     role: OrgRole.Owner
            //   }
            // });
            user = {
              ...user,
              id: newUser.id,
              uuid: newUser.uuid,
              roles: newUser.role_id,
              email: profile.email || "",
              name: newUser.name || "",
              username: newUser.username || "",
              avatar: newUser.avatar
            };
          }
          default: {
            user = {
              ...user,
              id: user.id,
              uuid: user.uuid,
              roles: user.roles,
              orgUser: user.orgUser,
              email: profile.email || "",
              name: user.name || "",
              username: user.username || "",
              avatar: user.avatar,
            };

          }
        }
      }
      return true;

      // Get user roles
    },
    session: ({ session, token }) => {
      // console.log("In session", session);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId,
          uuid: token.uuid,
          roles: token.roles,
          email: token.email,
          name: token.name,
          username: token.username,
          orgUser: token.orgUser,
          firstName: token.firstName,
          lastName: token.lastName,
        }
      } as Session & { user: { id: string } };
    },
  },
  session: {
    strategy: "jwt"
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      // @ts-ignore
      authorize: async (credentials, req) => {
        if (!credentials) {
          return null
        }
        
        // Rate limiting for authentication attempts
        try {
          const { checkAuthRateLimit } = await import('@/lib/rate-limit');
          const identifier = `ip:${req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'}`;
          const rateLimitResult = await checkAuthRateLimit(identifier);
          
          if (!rateLimitResult.success) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Too many login attempts. Try again in ${rateLimitResult.retryAfter} seconds.`,
            });
          }
        } catch (error) {
          if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS") {
            throw error;
          }
          // Log rate limiting error but don't block login
          console.error('Rate limiting error during login:', error);
        }
        
        // console.log("In authorize", credentials);
        const user = await findUserByEmail(credentials.email);

        console.log("In authorize: user", user);

        // const user = await prisma.user.findFirst({
        //   where: {
        //     email: {
        //       equals: {
        //         default: credentials?.email
        //       }
        //     }
        //   }
        // })

        if (!user) {
          return {
            id: 0,
            uuid: "",
            name: "",
            email: "",
            username: "",
            roles: [],
            orgUser: [],
            avatar: ""
          }

          // throw new TRPCError({
          //   code: "BAD_REQUEST",
          //   message: "This email is not registered, please confirm that the entered email is correct.",
          // })
        }

        const validatePassword = bcrypt.compareSync(credentials?.password, user.password ?? '')

        if (!user.password || !validatePassword) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid email and password combination.",
          })
        }

        return {
          id: user.id,
          uuid: user.uuid,
          name: user.name,
          username: user.username,
          // @ts-ignore
          email: credentials.email,
          roles: user.roles,
          orgUser: user.orgUser,
          avatar: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
          // credit_balance: user.orgUser?.map(org => org.credit_balance).reduce((a, b) => a + b, 0)
        }
      }
    }),
  ]
};

const findUserByEmail = async (email: string): Promise<User> => {
  console.log('in findUserByEmail: email', email);
  const data = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: {
            path: ['default'],
            equals: email,
          },
        },
        {
          email: {
            path: ['org_email'],
            equals: email,
          },
        }
      ]

    },
    include: {
      org_user: true,
      user_wallet: {
        select: {
          key: true,
          iv: true,
          salt: true
        }
      },
    },
  });
  // console.log('User data', data)
  if (!data) {
    // throw new TRPCError({
    //   code: "BAD_REQUEST",
    //   message: "This email is not registered, please confirm that the entered email is correct.",
    // })
    return {} as User;
  }

  const policies = await prisma.role.findMany({
    where: {
      id: {
        in: data.role_id.map((role_id: any) => Number(role_id))
      }
    },
    include: {
      role_policy: true
    }
  }).then((roles: any) => roles.map((role: any) => {
    const policies = role.role_policy.map((policy: any) => ({
      id: Number(policy.id),
      name: policy.name,
      can_create: policy.can_create,
      can_read: policy.can_read,
      can_update: policy.can_update,
      can_delete: policy.can_delete
    }))
    return {
      id: role.id,
      name: role.name,
      title: role.title,
      policies: policies
    }
  }
  ))


  return {
    id: data?.id,
    uuid: data?.uuid || "",
    name: data?.name || "",
    username: data?.username || "",
    email: email || "",
    password: data?.password,
    orgUser: data?.org_user,
    // roles: data?.role_id.map(Number(data?.role_id) => data?.role_id.org_id),
    // roles: data.role_id ? data.role_id.map((role) => Number(role)) : null,
    avatar: data?.avatar,
    roles: policies,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
  };
}
/**
* Wrapper for `getServerSession` so that you don't need to import the
* `authOptions` in every file.
*
* @see https://next-auth.js.org/configuration/nextjs
**/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};